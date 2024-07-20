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

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import moment from "moment/moment";
import axiosInstance from "../../services/axiosService";
import { UrlActionContext } from "../../App";

const Users = () => {
  //meta title
  document.title = "Users";

  const urlActions = useContext(UrlActionContext);

  if (urlActions) {
    if (!urlActions.includes("view")) {
      return (
        <>
          <div className="page-content">
            <Container fluid>
              <div className="alert alert-danger">
                Not authorized to view this page
              </div>
            </Container>
          </div>
        </>
      );
    }
  }

  const [user, setUser] = useState();
  const [isLoading, setLoading] = useState(true);
  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (user && user.id) || "",
      name: (user && user.username) || "",
      phone: (user && user.phone) || "",
      branch: (user && user.branchId) || "",
      password: (user && user.password) || "",
      confirmPassword: (user && user.confirm_password) || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please enter username"),
      phone: Yup.string(),
      branch: Yup.number(),
      password: Yup.string(),
      //   .required("Please enter password"),
      confirmPassword: Yup.string(),
      //   .required("Please confirm password"),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        const info = {
          userId: values["id"],
          name: values["name"],
          phone: values["phone"],
          branchId: values["branch"],
        };

        try {
          const { data } = await axiosInstance.post(`users/update_user`, info);
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchUsers();
          } else {
            toast.error("Sorry something went wrong");
          }
        } catch (err) {
          toast.error("Sorry something went wrong");
        }
      } else {
        const info = {
          name: values["name"],
          phone: values["phone"],
          branchId: values["branch"],
          password: values["password"],
          confirmPassword: values["confirmPassword"],
        };

        try {
          const { data } = await axiosInstance.post("users", info);
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchUsers();
          } else {
            toast.error("Sorry something went wrong");
          }
        } catch (err) {
          toast.error("Sorry something went wrong");
        }

        // save new user
      }
    },
  });

  const [isNewModalOpen, setIsNewModelOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("users");
      if (data.success) {
        setUsers(data.users);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };
  const fetchBranches = async () => {
    try {
      const { data } = await axiosInstance.get("branches");
      setBranches(data.branches);
    } catch (error) {
      console.log("Error ", error);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchUsers();
  }, []);

  const onDeleteUser = async () => {
    try {
      const { data } = await axiosInstance.post("users/delete", {
        id: user.id,
      });
      if (data.success) {
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchUsers();
      } else {
        toast.error("Something went wrong");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "User Name",
        accessorKey: "username",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Phone",
        accessorKey: "phone",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Branch",
        accessorKey: "branch_name",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "status",
        accessorKey: "status",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Last login",
        accessorKey: "last_login",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          const lastLoginDate = cell.row.original.last_login;
          if (!lastLoginDate) return <></>;
          const formattedDate = moment(lastLoginDate.toString()).format(
            "D MMM YY h:mmA"
          );
          return <>{formattedDate}</>;
        },
      },
      {
        header: "Action",
        cell: (cellProps) => {
          return (
            <div className="d-flex gap-3">
              {urlActions.includes("edit") && (
                <Link
                  to="#"
                  className="text-success"
                  onClick={() => {
                    setIsEdit(true);
                    const userData = cellProps.row.original;
                    setUser(userData);
                    setIsNewModelOpen(true);
                  }}
                >
                  <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
                </Link>
              )}
              {urlActions.includes("delete") && (
                <Link
                  to="#"
                  className="text-danger"
                  onClick={() => {
                    const userData = cellProps.row.original;
                    setUser(userData);
                    setDeleteModal(true);
                  }}
                >
                  <i
                    className="mdi mdi-delete font-size-18"
                    id="deletetooltip"
                  />
                </Link>
              )}
            </div>
          );
        },
      },
    ],
    [urlActions]
  );

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        warningText="Are you sure to delete this user?"
        onDeleteClick={onDeleteUser}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="Users" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={users || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={urlActions.includes("create")}
                      handleUserClick={() => {
                        setIsEdit(false);
                        setUser("");
                        setIsNewModelOpen(!isNewModalOpen);
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New User"
                      tableClass="align-middle table-nowrap table-hover dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                      theadClass="table-light"
                      paginationWrapper="dataTables_paginate paging_simple_numbers pagination-rounded"
                      pagination="pagination"
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
          <Modal
            isOpen={isNewModalOpen}
            toggle={() => setIsNewModelOpen(!isNewModalOpen)}
          >
            <ModalHeader
              toggle={() => setIsNewModelOpen(!isNewModalOpen)}
              tag="h4"
            >
              {!!isEdit ? "Edit User" : "Add User"}
            </ModalHeader>
            <ModalBody>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  validation.handleSubmit();
                  return false;
                }}
              >
                <Row>
                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>User Name</Label>
                      <Input
                        name="name"
                        type="text"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.name || ""}
                        invalid={
                          validation.touched.name && validation.errors.name
                            ? true
                            : false
                        }
                      />
                      {validation.touched.name && validation.errors.name ? (
                        <FormFeedback type="invalid">
                          {validation.errors.name}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <Row>
                      <Col lg="6">
                        <div className="mb-3">
                          <Label>Phone</Label>
                          <Input
                            name="phone"
                            label="Phone"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.phone || ""}
                            invalid={
                              validation.touched.phone &&
                              validation.errors.phone
                                ? true
                                : false
                            }
                          />
                          {validation.touched.phone &&
                          validation.errors.phone ? (
                            <FormFeedback type="invalid">
                              {" "}
                              {validation.errors.phone}{" "}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </Col>
                      <Col lg="6">
                        <div className="mb-3">
                          <Label>Branch</Label>
                          <Input
                            name="branch"
                            label="Branch"
                            type="select"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.branch || ""}
                            invalid={
                              validation.touched.branch &&
                              validation.errors.branch
                                ? true
                                : false
                            }
                          >
                            <option value="">Select type</option>
                            {branches?.map((b) => {
                              return (
                                <option key={b.id} value={b.id}>
                                  {b.branch_name}
                                </option>
                              );
                            })}
                          </Input>
                          {validation.touched.branch &&
                          validation.errors.branch ? (
                            <FormFeedback type="invalid">
                              {" "}
                              {validation.errors.branch}{" "}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </Col>
                    </Row>
                    {!isEdit && (
                      <Row>
                        <Col xs={6}>
                          <div className="mb-3">
                            <Label>Password</Label>
                            <Input
                              name="password"
                              label="Password"
                              type="text"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.password || ""}
                              invalid={
                                validation.touched.password &&
                                validation.errors.password
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.password &&
                            validation.errors.password ? (
                              <FormFeedback type="invalid">
                                {" "}
                                {validation.errors.password}{" "}
                              </FormFeedback>
                            ) : null}
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="mb-3">
                            <Label>Confirm password</Label>
                            <Input
                              name="confirmPassword"
                              label="Password"
                              type="text"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.confirmPassword || ""}
                              invalid={
                                validation.touched.confirmPassword &&
                                validation.errors.confirmPassword
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.confirmPassword &&
                            validation.errors.confirmPassword ? (
                              <FormFeedback type="invalid">
                                {" "}
                                {validation.errors.confirmPassword}{" "}
                              </FormFeedback>
                            ) : null}
                          </div>
                        </Col>
                      </Row>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="text-end">
                      <Button
                        type="submit"
                        color="success"
                        className="save-user"
                      >
                        {!!isEdit ? "Update User" : "Add User"}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </ModalBody>
          </Modal>
        </Container>
      </div>
      <ToastContainer />
    </React.Fragment>
  );
};

export default Users;
