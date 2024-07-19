import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";

// //Import Scrollbar
import SimpleBar from "simplebar-react";

// MetisMenu
import MetisMenu from "metismenujs";
import { Link, useLocation } from "react-router-dom";
import withRouter from "../Common/withRouter";

//i18n
import { withTranslation } from "react-i18next";
import { useCallback } from "react";

const SidebarContent = (props) => {
  const ref = useRef();
  const path = useLocation();

  const userMenues = JSON.parse(localStorage.getItem("current_user_menue"));

  const activateParentDropdown = useCallback((item) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];
    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.lenght && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;

        if (parent2) {
          parent2.classList.remove("mm-show");

          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");

            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };

  const activeMenu = useCallback(() => {
    const pathName = path.pathname;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [path.pathname, activateParentDropdown]);

  useEffect(() => {
    ref.current.recalculate();
  }, []);

  useEffect(() => {
    new MetisMenu("#side-menu");
    activeMenu();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    activeMenu();
  }, [activeMenu]);

  function scrollElement(item) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  return (
    <React.Fragment>
      <SimpleBar className="h-100" ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            {/* <li className="menu-title">{props.t("Menu")} </li> */}
            {/* {userMenues.map((menu) => {
              if (menu.url.length > 0) {
                return (
                  <li>
                    <Link to={`${menu.url}`} className=" ">
                      <i className="bx bx-calendar"></i>
                      <span>{props.t(`${menu.title}`)}</span>
                    </Link>
                  </li>
                );
              }

              return (
                <li>
                  <Link to="/#" className="has-arrow">
                    <i className="bx bx-home-circle"></i>
                    <span>{props.t(`${menu.title}`)}</span>
                  </Link>
                  <ul className="sub-menu" aria-expanded="false">
                    {menu.subMenues.map((subMenu) => {
                      return (
                        <li>
                          <Link to={`${subMenu.url}`}>
                            {props.t(`${subMenu.title}`)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })} */}

            <li className="menu-title">{props.t("Old to be removed")} </li>
            <li>
              <Link to="/dashboard" className=" ">
                <i className="bx bx-calendar"></i>
                <span>{props.t("Dashboard")}</span>
              </Link>
            </li>
            <li>
              <Link to="/transfer_money" className=" ">
                <i className="bx bx-calendar"></i>
                <span>{props.t("Transfer Money")}</span>
              </Link>
            </li>
            <li>
              <Link to="/checks" className=" ">
                <i className="bx bx-calendar"></i>
                <span>{props.t("Checks")}</span>
              </Link>
            </li>
            <li>
              <Link to="/general_journal" className=" ">
                <i className="bx bx-calendar"></i>
                <span>{props.t("general journal")}</span>
              </Link>
            </li>
            <li>
              <Link to="/adjustments" className=" ">
                <i className="bx bx-calendar"></i>
                <span>{props.t("adjustments")}</span>
              </Link>
            </li>
            <li>
              <Link to="/transfer_inventory" className=" ">
                <i className="bx bx-calendar"></i>
                <span>{props.t("Transfer Inventory")}</span>
              </Link>
            </li>
            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-home-circle"></i>
                <span>{props.t("People")}</span>
              </Link>
              <ul className="sub-menu" aria-expanded="false">
                {/* <li>
                  <Link to="/account-types">{props.t("Account Types")}</Link>
                </li> */}
                <li>
                  <Link to="/users">{props.t("Users")}</Link>
                </li>
                <li>
                  <Link to="/user-permissions">{props.t("Permission")}</Link>
                </li>
                <li>
                  <Link to="/system-menu">{props.t("System Menu")}</Link>
                </li>
                <li>
                  <Link to="/system-sub-menu">{props.t("System Submenu")}</Link>
                </li>
                <li>
                  <Link to="/system-actions">{props.t("System Actions")}</Link>
                </li>
                <li>
                  <Link to="/accounts">{props.t("Accounts")}</Link>
                </li>
                <li>
                  <Link to="/vendors">{props.t("Vendors")}</Link>
                </li>
                <li>
                  <Link to="/customers">{props.t("Customers")}</Link>
                </li>
                <li>
                  <Link to="/warehouses">{props.t("Branches")}</Link>
                </li>
                {/* <li>
                  <Link to="/categories">{props.t("Categories")}</Link>
                </li> */}
                <li>
                  <Link to="/products">{props.t("Products")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-home-circle"></i>
                <span>{props.t("Purchases")}</span>
              </Link>
              <ul className="sub-menu" aria-expanded="false">
                <li>
                  <Link to="/purchases">{props.t("Purchases List")}</Link>
                </li>
                <li>
                  <Link to="/purchase-payments">
                    {props.t("Purchases Payments")}
                  </Link>
                </li>
                <li>
                  <Link to="/purchase-returns">
                    {props.t("Purchases Returns")}
                  </Link>
                </li>
                <li>
                  <Link to="/purchase-return-payments">
                    {props.t("Return Payments")}
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-home-circle"></i>
                <span>{props.t("Reports")}</span>
              </Link>
              <ul className="sub-menu" aria-expanded="false">
                <li>
                  <Link to="/reports/trial_balance">
                    {props.t("Trial Balance")}
                  </Link>
                </li>
                <li>
                  <Link to="/reports/balance_sheet">
                    {props.t("Balance Sheet")}
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-home-circle"></i>
                <span>{props.t("Sales")}</span>
              </Link>
              <ul className="sub-menu" aria-expanded="false">
                <li>
                  <Link to="/sales">{props.t("Sales List")}</Link>
                </li>
                <li>
                  <Link to="/sales-payments">{props.t("Sales Payments")}</Link>
                </li>
                <li>
                  <Link to="/sales-returns">{props.t("Sales Returns")}</Link>
                </li>
                <li>
                  <Link to="/sales-return-payments">
                    {props.t("Sales Return Payments")}
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};

SidebarContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
};

export default withRouter(withTranslation()(SidebarContent));
