export interface ListJsModel {
  // id: any;
  // customer_name: string;
  // email: string;
  // phone: string;
  // date: string;
  // status: string;
  // status_color: string;
  // isSelected?:any;

  id: any,
  codeIssueTime: string,
  elementType: string,
  elementName: string,
  switching: string,
  nldcCode: string,
  srldcCode: string,
  category: string,
  codeIssuedTo: string, 
  codeRequestedBy: string,
  isSelected?: any,
  codeId: string
}

export interface paginationModel {
  id: any;
  name: string;
  type: string;
  img: string;
}


export interface pendingEntryModel {
  id: any,
  codeIssueTime: string,
  elementType: string,
  elementName: string,
  switching: string,
  nldcCode: string,
  srldcCode: string,
  category: string,
  codeIssuedTo: string, 
  codeRequestedBy: string,
  

}



export interface pendingEntryModel {
  id: any,
  codeIssueTime: string,
  elementType: string,
  elementName: string,
  switching: string,
  srldcCode: string,
  category: string,
  codeIssuedTo: string, 
  codeRequestedBy: string,
  

}
