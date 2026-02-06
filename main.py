from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import uvicorn
import os
from datetime import datetime
from hyperion.scanner import HyperionScanner
from hyperion.feedback.store import get_feedback_store
from hyperion.feedback.models import Feedback, generate_finding_hash

app = FastAPI(title="Hyperion SAST", description="AI-Powered Security Scanner")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# DO NOT create a global scanner - it caches state across scans!
# scanner = HyperionScanner()  # REMOVED
feedback_store = get_feedback_store()

class ScanRequest(BaseModel):
    path: str

class FeedbackRequest(BaseModel):
    finding_hash: str
    verdict: str  # VALID_VULNERABILITY, FALSE_POSITIVE, ACCEPT_RISK
    project_path: str
    rule_id: str
    file_path: str
    line_number: int
    user: str = None
    reasoning: str = None

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/scan")
def scan_code(request: ScanRequest):
    path = request.path
    if not os.path.exists(path):
        return {"error": "Path does not exist"}
    
    # Create a FRESH scanner instance for each scan to avoid caching issues
    scanner = HyperionScanner()
    results = scanner.scan_project(path)
    
    # Pre-fetch all feedback for this project to avoid N+1 query problem
    all_project_feedback = feedback_store.get_all_feedback_for_project(path)
    
    # Add feedback status to findings
    for finding in results.get('findings', []):
        finding_hash = generate_finding_hash(finding)
        finding['finding_hash'] = finding_hash
        
        # Check if there's existing feedback in our pre-fetched dict
        existing_feedback = all_project_feedback.get(finding_hash)
        if existing_feedback:
            finding['feedback'] = {
                'verdict': existing_feedback.verdict,
                'timestamp': existing_feedback.timestamp.isoformat(),
                'user': existing_feedback.user
            }
    
    return results

from fastapi.responses import FileResponse
from generate_reports import generate_professional_reports

class ReportRequest(BaseModel):
    path: str

@app.post("/report/csv")
async def download_csv_report(request: ReportRequest):
    """Generates and returns the Professional CSV Report"""
    path = request.path
    if not os.path.exists(path):
        return {"error": "Path does not exist"}
        
    try:
        # Generate reports in the project root
        report_paths = await generate_professional_reports(path)
        return FileResponse(
            path=report_paths['csv'], 
            filename=f"hyperion_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            media_type='text/csv'
        )
    except Exception as e:
        return {"error": str(e)}

@app.post("/report/html")
async def download_html_report(request: ReportRequest):
    """Generates and returns the Professional HTML Report"""
    path = request.path
    if not os.path.exists(path):
        return {"error": "Path does not exist"}
        
    try:
        report_paths = await generate_professional_reports(path)
        return FileResponse(
            path=report_paths['html'], 
            filename=f"hyperion_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html",
            media_type='text/html'
        )
    except Exception as e:
        return {"error": str(e)}

from hyperion.feedback.suppression_generator import SuppressionGenerator

# ... (existing imports)

# Initialize generator
suppression_generator = SuppressionGenerator(feedback_store)

@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """Store developer feedback on a finding"""
    try:
        feedback = Feedback(
            finding_hash=request.finding_hash,
            verdict=request.verdict,
            project_path=request.project_path,
            rule_id=request.rule_id,
            file_path=request.file_path,
            line_number=request.line_number,
            timestamp=datetime.now(),
            user=request.user,
            reasoning=request.reasoning
        )
        
        success = feedback_store.add_feedback(feedback)
        
        if success:
            # If False Positive, trigger suppression generation
            if request.verdict == 'FALSE_POSITIVE':
                try:
                    suppressions = suppression_generator.generate_suppressions(request.project_path)
                    suppression_generator.save_suppressions(request.project_path, suppressions)
                    print(f"Generated {len(suppressions)} suppression rules for {request.project_path}")
                except Exception as e:
                    print(f"Error generating suppressions: {e}")

            return {
                "status": "success",
                "message": "Feedback recorded successfully"
            }
        else:
            return {
                "status": "error",
                "message": "Failed to store feedback"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/feedback/stats/{project_path:path}")
async def get_feedback_stats(project_path: str):
    """Get feedback statistics for a project"""
    stats = feedback_store.get_stats(project_path)
    return stats

if __name__ == "__main__":
    # When running as an EXE (frozen), reload=True doesn't work and import strings can be flaky.
    # We pass the app object directly.
    import sys
    
    if getattr(sys, 'frozen', False):
         # Auto-open browser for "App-like" experience
         import webbrowser
         import threading
         import time
         
         def open_browser():
             time.sleep(1.5) # Wait for server to start
             webbrowser.open("http://127.0.0.1:8000")
             
         threading.Thread(target=open_browser, daemon=True).start()
         uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info", reload=False)
    else:
         uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
