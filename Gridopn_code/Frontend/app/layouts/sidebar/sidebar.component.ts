import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { MenuFilterService } from 'src/app/core/services/menu-filter.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  menu: any;
  toggle: any = true;
  menuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();

  permissions: string[] = [];

  userData: any;

  constructor(private router: Router, public translate: TranslateService, public TokenStorageService: TokenStorageService,private auth: AuthenticationService ,
  private menuFilter: MenuFilterService) {
    translate.setDefaultLang('en');
  }

ngOnInit(): void {
  // Always load the full menu
  this.menuItems = MENU;

  // 1) initial read from localStorage
  this.userData = this.TokenStorageService.getUser() || {};
  this.permissions = (this.userData.permissions || []).map((p: string) => p.toLowerCase());

  // filter with what we currently have (maybe empty)
  this.filteredMenuItems = this.menuFilter.filterMenu(this.menuItems, this.userData);

  // 2) if permissions are missing, try /me to populate them
  if (!this.permissions.length) {
    // call backend /me to fetch authoritative user + permissions
    this.auth.me().subscribe({
      next: (me: any) => {
        // some backends return { status: 'success', ... } or plain user object
        if (!me) return;

        // If backend wraps data in { status, ... } use me.body or me.user accordingly.
        // In your backend you return plain JSON with permissions array, so use me directly.
        const fetched = me;

        // merge existing stored fields (username, state_name) with fetched
        const mergedUser = {
          ...(this.userData || {}),
          ...(fetched || {})
        };

        // ensure permissions exist as array
        mergedUser.permissions = mergedUser.permissions || [];

        // persist
        this.TokenStorageService.setUser(mergedUser);

        // re-read and compute
        this.userData = mergedUser;
        this.permissions = (this.userData.permissions || []).map((p: string) => p.toLowerCase());
        this.filteredMenuItems = this.menuFilter.filterMenu(this.menuItems, this.userData);

        // notify AuthenticationService so other consumers (topbar etc.) update immediately
        this.auth.refreshCurrentUserFromStorage();
      },
      error: (err) => {
        // ignore; user remains as-is (likely not logged in)
        console.warn('me() failed', err);
      }
    });
  }

  // 3) Subscribe to auth changes (login/logout). This keeps menu live after login/logout
  this.auth.currentUser.subscribe((u) => {
    this.userData = u || this.TokenStorageService.getUser() || {};
    this.permissions = (this.userData.permissions || []).map((p: string) => p.toLowerCase());
    this.filteredMenuItems = this.menuFilter.filterMenu(this.menuItems, this.userData);

    // console.log('SIDEBAR - userData:', this.userData);
    // console.log('SIDEBAR - permissions:', this.permissions);
    // console.log('SIDEBAR - filtered menu:', this.filteredMenuItems);
  });

  // 4) Active menu highlight
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) this.initActiveMenu();
  });
}


  /***
   * Activate droup down set
   */
  ngAfterViewInit() {
    setTimeout(() => {
      this.initActiveMenu();
    }, 0);
  }


  removeActivation(items: any) {
    items.forEach((item: any) => {
      if (item.classList.contains("menu-link")) {
        if (!item.classList.contains("active")) {
          item.setAttribute("aria-expanded", false);
        }
        (item.nextElementSibling) ? item.nextElementSibling.classList.remove("show") : null;
      }
      if (item.classList.contains("nav-link")) {
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove("show");
        }
        item.setAttribute("aria-expanded", false);
      }
      item.classList.remove("active");
    });
  }

  toggleSubItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let isMenu = isCurrentMenuId.nextElementSibling as any;
    if (isMenu.classList.contains("show")) {
      isMenu.classList.remove("show");
      isCurrentMenuId.setAttribute("aria-expanded", "false");
    } else {
      let dropDowns = Array.from(document.querySelectorAll('.sub-menu'));
      dropDowns.forEach((node: any) => {
        node.classList.remove('show');
      });

      let subDropDowns = Array.from(document.querySelectorAll('.menu-dropdown .nav-link'));
      subDropDowns.forEach((submenu: any) => {
        submenu.setAttribute('aria-expanded', "false");
      });

      if (event.target && event.target.nextElementSibling) {
        isCurrentMenuId.setAttribute("aria-expanded", "true");
        event.target.nextElementSibling.classList.toggle("show");
      }
    }
  };

  toggleExtraSubItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let isMenu = isCurrentMenuId.nextElementSibling as any;
    if (isMenu.classList.contains("show")) {
      isMenu.classList.remove("show");
      isCurrentMenuId.setAttribute("aria-expanded", "false");
    } else {
      let dropDowns = Array.from(document.querySelectorAll('.extra-sub-menu'));
      dropDowns.forEach((node: any) => {
        node.classList.remove('show');
      });

      let subDropDowns = Array.from(document.querySelectorAll('.menu-dropdown .nav-link'));
      subDropDowns.forEach((submenu: any) => {
        submenu.setAttribute('aria-expanded', "false");
      });

      if (event.target && event.target.nextElementSibling) {
        isCurrentMenuId.setAttribute("aria-expanded", "true");
        event.target.nextElementSibling.classList.toggle("show");
      }
    }
  };

  // Click wise Parent active class add
  toggleParentItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let dropDowns = Array.from(document.querySelectorAll('#navbar-nav .show'));
    dropDowns.forEach((node: any) => {
      node.classList.remove('show');
    });
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const iconItems = Array.from(ul.getElementsByTagName("a"));
      let activeIconItems = iconItems.filter((x: any) => x.classList.contains("active"));
      activeIconItems.forEach((item: any) => {
        item.setAttribute('aria-expanded', "false")
        item.classList.remove("active");
      });
    }
    isCurrentMenuId.setAttribute("aria-expanded", "true");
    if (isCurrentMenuId) {
      this.activateParentDropdown(isCurrentMenuId);
    }
  }

  toggleItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let isMenu = isCurrentMenuId.nextElementSibling as any;
    if (isMenu.classList.contains("show")) {
      isMenu.classList.remove("show");
      isCurrentMenuId.setAttribute("aria-expanded", "false");
    } else {
      let dropDowns = Array.from(document.querySelectorAll('#navbar-nav .show'));
      dropDowns.forEach((node: any) => {
        node.classList.remove('show');
      });
      (isMenu) ? isMenu.classList.add('show') : null;
      const ul = document.getElementById("navbar-nav");
      if (ul) {
        const iconItems = Array.from(ul.getElementsByTagName("a"));
        let activeIconItems = iconItems.filter((x: any) => x.classList.contains("active"));
        activeIconItems.forEach((item: any) => {
          item.setAttribute('aria-expanded', "false")
          item.classList.remove("active");
        });
      }
      isCurrentMenuId.setAttribute("aria-expanded", "true");
      if (isCurrentMenuId) {
        this.activateParentDropdown(isCurrentMenuId);
      }
    }
  }

  // remove active items of two-column-menu
  activateParentDropdown(item: any) {
    item.classList.add("active");
    let parentCollapseDiv = item.closest(".collapse.menu-dropdown");

    if (parentCollapseDiv) {
      // to set aria expand true remaining
      parentCollapseDiv.classList.add("show");
      parentCollapseDiv.parentElement.children[0].classList.add("active");
      parentCollapseDiv.parentElement.children[0].setAttribute("aria-expanded", "true");
      if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
        parentCollapseDiv.parentElement.closest(".collapse").classList.add("show");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse")) {
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").classList.add("show");
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").previousElementSibling.classList.add("active");
        }
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      this.removeActivation(items);
    }
    this.activateParentDropdown(event.target);
  }

  initActiveMenu() {
    const pathName = window.location.pathname;
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      let activeItems = items.filter((x: any) => x.classList.contains("active"));
      this.removeActivation(activeItems);

      let matchingMenuItem = items.find((x: any) => {
        return x.pathname === pathName;
      });
      if (matchingMenuItem) {
        this.activateParentDropdown(matchingMenuItem);
      }
    }
  }

  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    var sidebarsize = document.documentElement.getAttribute("data-sidebar-size");
    if (sidebarsize == 'sm-hover-active') {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover')
    } else {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover-active')
    }
  }

  /**
   * SidebarHide modal
   * @param content modal content
   */
  SidebarHide() {
    document.body.classList.remove('vertical-sidebar-enable');
  }

  // Recursively copy menu item and filter according to `allowRoles` / `denyRoles` etc
  // copyAndFilterItem(item: MenuItem): MenuItem | null {
  //   // if it's a title, show it
  //   if (item.isTitle) return item;

  //   if (!this.isAllowedByItem(item)) return null;

  //   const copy: MenuItem = { ...item };
  //   if (copy.subItems && copy.subItems.length) {
  //     copy.subItems = copy.subItems
  //       .map(si => this.copyAndFilterItem(si))
  //       .filter(Boolean) as MenuItem[];

  //     // If no subitems remain, and it had no direct link, drop it
  //     if (!copy.subItems.length && !copy.link) return null;
  //   }
  //   return copy;
  // }

  // isAllowedByItem(item: MenuItem): boolean {
  //   if (!this.userData) return false;

  //   const role = (this.userData.role || '').toString().toLowerCase();
  //   const username = (this.userData.user || this.userData.username || '').toString().toLowerCase();
  //   const stateId = Number(this.userData.state_id ?? -1);

  //   // allowRoles -> only show if role in allowRoles
  //   if (item.allowRoles && item.allowRoles.length) {
  //     if (!item.allowRoles.map(x => x.toLowerCase()).includes(role)) return false;
  //   }

  //   // denyRoles -> hide if role in denyRoles
  //   if (item.denyRoles && item.denyRoles.map(x => x.toLowerCase()).includes(role)) return false;

  //   if (item.allowUsers && item.allowUsers.length) {
  //     if (!item.allowUsers.map(x => x.toLowerCase()).includes(username)) return false;
  //   }
  //   if (item.denyUsers && item.denyUsers.map(x => x.toLowerCase()).includes(username)) return false;

  //   if (item.allowStates && item.allowStates.length) {
  //     if (!item.allowStates.includes(stateId)) return false;
  //   }
  //   if (item.denyStates && item.denyStates.includes(stateId)) return false;

  //   return true;
  // }



// hasPermissions(required: string[] = []): boolean {
//   if (required.length === 0) return true;
//   // User must have at least one required permission OR ALL based on your rule
//   return required.some(rp => this.permissions.includes(rp));
// }


}
