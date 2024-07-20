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

import {
  getUsers as onGetUsers,
  addNewUser as onAddNewUser,
  updateUser as onUpdateUser,
  deleteUser as onDeleteUser,
} from "/src/store/contacts/actions";
import { isEmpty } from "lodash";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import moment from "moment/moment";
import { LoggedUserContext, UrlActionContext } from "../../App";

const Vendors = () => {
  //meta title
  document.title = "Vendors";

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

  const dispatch = useDispatch();
  const [vendor, setVendor] = useState();
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState();

  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (vendor && vendor.id) || "",
      name: (vendor && vendor.name) || "",
      phone: (vendor && vendor.phone) || "",
      openingBalance: (vendor && vendor.openingBalance) || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Your Name"),
      phone: Yup.string(),
      openingBalance: Yup.number("must enter a number"),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        const updatedUser = {
          name: values["name"],
          phone: values["phone"],
        };

        const vendorId = values["id"];

        try {
          const { data } = await axios.put(
            `http://localhost:5000/api/vendors/${vendorId}`,
            updatedUser
          );
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchVendors();
          } else {
            toast.error("Sorry something went wrong");
          }
        } catch (err) {
          toast.error("Sorry something went wrong");
        }
      } else {
        const newVendor = {
          name: values["name"],
          phone: values["phone"],
          openingBalance: values["openingBalance"],
          userId: user.id,
          branchId: user.branchId,
        };

        try {
          const { data } = await axios.post(
            "http://localhost:5000/api/vendors",
            newVendor
          );
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchVendors();
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
  const [vendors, setVendors] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/vendors");
      if (data.success) {
        setVendors(data.vendors);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const onDeleteVendor = async () => {
    try {
      const { data } = await axios.delete(
        "http://localhost:5000/api/vendors/" + vendor.id
      );
      if (data.success) {
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchVendors();
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
        header: "Name",
        accessorKey: "name",
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
        header: "Registered Date",
        accessorKey: "createdAt",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          const formattedDate = moment(
            cell.row.original.createdAt.toString()
          ).format("D MMM YY h:mmA");
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
                    setVendor(userData);
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
                    setVendor(userData);
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
        onDeleteClick={onDeleteVendor}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="Vendors" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={vendors || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={urlActions.includes("create")}
                      handleUserClick={() => {
                        setIsEdit(false);
                        setVendor("");
                        setIsNewModelOpen(!isNewModalOpen);
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Vendor"
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
              {!!isEdit ? "Edit Vendor" : "Add Vendor"}
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
                      <Label>Name</Label>
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
                      <Col xs={isEdit ? 12 : 6}>
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
                      {!isEdit && (
                        <Col xs={isEdit ? 12 : 6}>
                          <div className="mb-3">
                            <Label>Opening Balance</Label>
                            <Input
                              name="openingBalance"
                              label="Balance"
                              type="number"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.openingBalance || ""}
                              invalid={
                                validation.touched.openingBalance &&
                                validation.errors.openingBalance
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.openingBalance &&
                            validation.errors.openingBalance ? (
                              <FormFeedback type="invalid">
                                {" "}
                                {validation.errors.openingBalance}{" "}
                              </FormFeedback>
                            ) : null}
                          </div>
                        </Col>
                      )}
                    </Row>
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
                        {!!isEdit ? "Update Vendor" : "Add Vendor"}
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

export default Vendors;
