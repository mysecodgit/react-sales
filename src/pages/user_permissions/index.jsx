import React, { useEffect, useState, useMemo, useContext } from "react";
import { Link } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";
import TableContainer from "../../components/Common/TableContainer";
import Spinners from "../../components/Common/Spinner";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  FormFeedback,
  Input,
  Form,
  Button,
  UncontrolledTooltip,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  FormGroup,
  Badge,
} from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";

//Import Breadcrumb
import Breadcrumbs from "/src/components/Common/Breadcrumb";
import DeleteModal from "/src/components/Common/DeleteModal";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import moment from "moment/moment";
import axiosInstance from "../../services/axiosService";
import Select from "react-select";
import { actions } from "react-table";
import { UrlActionContext, LoggedUserContext } from "../../App";

const UserPermissions = () => {
  //meta title
  document.title = "User Permissions";

  const loggedUser = useContext(LoggedUserContext);
  const urlActions = useContext(UrlActionContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (loggedUser) {
      console.log("logged user", loggedUser);
      setUser(loggedUser);
    }
  }, [loggedUser]);

  // if (urlActions) {
  //   if (!urlActions.includes("view")) {
  //     return (
  //       <>
  //         <div className="page-content">
  //           <Container fluid>
  //             <div className="alert alert-danger">
  //               Not authorized to view this page
  //             </div>
  //           </Container>
  //         </div>
  //       </>
  //     );
  //   }
  // }

  const [users, setUsers] = useState();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [systemMenues, setSystemMenues] = useState([]);
  const [userPermission, setUserPermissions] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get("users");
      if (data.success) {
        setUsers(
          data.users.map((user) => ({ label: user.username, value: user.id }))
        );
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("permissions");
      if (data.success) {
        setSystemMenues(data.menues);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };

  const fetchUserPermission = async (userId) => {
    try {
      const { data } = await axiosInstance.get(`permissions/${userId}`);
      if (data.success) {
        setUserPermissions({
          menues: data.menues,
          subMenues: data.subMenues,
          actions: data.actions,
        });

        const updated = systemMenues.map((menu) => {
          let upsub = menu.subMenues.map((sub) => {
            let upact = sub.actions.map((action) => {
              return {
                ...action,
                isSelected: data.actions.some((a) => a.action_id == action.id),
              };
            });

            return {
              ...sub,
              actions: upact,
              isSelected: data.subMenues.some((s) => s.sub_menu_id == sub.id),
            };
          });

          return {
            ...menu,
            subMenues: upsub,
            isSelected: data.menues.some((m) => m.menu_id == menu.id),
          };
        });
        console.log(updated);
        setSystemMenues(updated);
      }
    } catch (error) {
      toast.error("could not get user permission");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserPermissions();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserPermission(selectedUser.value);
    }
  }, [selectedUser]);

  const hanleMenuChange = (e, index) => {
    const newArr = [...systemMenues];
    const currentMenu = newArr[index];
    newArr[index] = {
      ...currentMenu,
      subMenues: currentMenu.subMenues.map((sub) => {
        let act = sub.actions.map((action) => ({
          ...action,
          isSelected: !newArr[index].isSelected,
        }));
        return {
          ...sub,
          actions: act,
          isSelected: !newArr[index].isSelected,
        };
      }),
      isSelected: !newArr[index].isSelected,
    };
    setSystemMenues(newArr);
  };

  const hanleSubMenuChange = (e, index, subIndex) => {
    const newArr = [...systemMenues];
    const currentMenu = newArr[index];
    const currentSubMenu = currentMenu.subMenues[subIndex];

    let updatedSubMenues = currentMenu.subMenues.map((sub) => {
      let act = currentSubMenu.actions.map((action) => ({
        ...action,
        isSelected:
          currentSubMenu.id == sub.id
            ? !currentSubMenu.isSelected
            : action.isSelected,
      }));
      return {
        ...sub,
        actions: currentSubMenu.id == sub.id ? act : sub.actions,
        isSelected:
          currentSubMenu.id == sub.id
            ? !currentSubMenu.isSelected
            : sub.isSelected,
      };
    });

    newArr[index] = {
      ...currentMenu,
      subMenues: updatedSubMenues,
      isSelected:
        updatedSubMenues.filter((s) => s.isSelected == true).length > 0,
    };
    setSystemMenues(newArr);
  };

  const hanleActionChange = (e, index, subIndex, actionIndex) => {
    const newArr = [...systemMenues];
    const currentMenu = newArr[index];
    const currentSubMenu = currentMenu.subMenues[subIndex];
    const currentAction = currentSubMenu.actions[actionIndex];

    let updatedSubMenu = currentMenu.subMenues.map((sub) => {
      let act = currentSubMenu.actions.map((action) => ({
        ...action,
        isSelected:
          currentAction.id == action.id
            ? !currentAction.isSelected
            : action.isSelected,
      }));
      return {
        ...sub,
        actions: currentSubMenu.id == sub.id ? act : sub.actions,
        isSelected:
          currentSubMenu.id == sub.id
            ? act.filter((a) => a.isSelected == true).length > 0
            : sub.isSelected,
      };
    });

    console.log("updated sub", updatedSubMenu);

    newArr[index] = {
      ...currentMenu,
      subMenues: updatedSubMenu,
      isSelected: updatedSubMenu.filter((s) => s.isSelected == true).length > 0,
    };
    setSystemMenues(newArr);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="User Permissions" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <Row>
                      <Col lg="7">
                        <div className="mb-3">
                          <Label>Users</Label>
                          <Select
                            name=""
                            value={selectedUser}
                            onChange={setSelectedUser}
                            options={users}
                            className="select2-selection"
                          />
                        </div>
                      </Col>
                      <Col lg="5">
                        <Button
                          color="primary"
                          className="mt-4 px-4"
                          disabled={!selectedUser}
                          onClick={async () => {
                            const filteredMenues = systemMenues.filter(
                              (menu) => {
                                menu.subMenues = menu.subMenues.filter(
                                  (sub) => {
                                    sub.actions = sub.actions.filter(
                                      (action) => action.isSelected
                                    );
                                    return sub.isSelected;
                                  }
                                );
                                return menu.isSelected;
                              }
                            );

                            if (!selectedUser) {
                              return toast.error("select a user");
                            }

                            try {
                              const { data } = await axiosInstance.post(
                                "permissions/givePerms",
                                {
                                  userId: selectedUser.value,
                                  menues: filteredMenues,
                                }
                              );
                              if (data.success) {
                                toast.success(data.message);
                              }
                            } catch (err) {
                              toast.error("Something went wrong");
                            }
                          }}
                        >
                          Save
                        </Button>
                      </Col>
                    </Row>

                    <Row className="gap-3">
                      {systemMenues.map((menu, index) => {
                        return (
                          <Col lg="3" className="border py-2 ">
                            <div className="form-check mb-2">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`menu-${menu.id}`}
                                value="checked"
                                checked={menu.isSelected}
                                onChange={(e) => hanleMenuChange(e, index)}
                              />
                              <Label
                                className="form-check-label"
                                htmlFor={`menu-${menu.id}`}
                              >
                                {menu.title}
                              </Label>
                            </div>
                            {menu.subMenues.map((subMenu, i) => {
                              return (
                                <div>
                                  <div className="form-check mb-2 ms-3">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      id={`sub-menu-${subMenu.id}`}
                                      value="checked"
                                      checked={subMenu.isSelected}
                                      onChange={(e) =>
                                        hanleSubMenuChange(e, index, i)
                                      }
                                    />
                                    <Label
                                      className="form-check-label"
                                      htmlFor={`sub-menu-${subMenu.id}`}
                                    >
                                      {subMenu.title}
                                    </Label>
                                  </div>
                                  {subMenu.actions.map((action, i2) => {
                                    return (
                                      <div className="form-check mb-2 ms-5">
                                        <input
                                          type="checkbox"
                                          className="form-check-input"
                                          id={`action-${action.id}`}
                                          value="checked"
                                          checked={action.isSelected}
                                          onChange={(e) =>
                                            hanleActionChange(e, index, i, i2)
                                          }
                                        />
                                        <Label
                                          className="form-check-label"
                                          htmlFor={`action-${action.id}`}
                                        >
                                          {action.title}
                                        </Label>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </Col>
                        );
                      })}
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
      <ToastContainer />
    </React.Fragment>
  );
};

export default UserPermissions;
