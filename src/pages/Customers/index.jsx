import React, { useEffect, useState, useMemo, useContext } from "react";
import { Link } from "react-router-dom";
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
} from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";

//Import Breadcrumb
import Breadcrumbs from "/src/components/Common/Breadcrumb";
import DeleteModal from "/src/components/Common/DeleteModal";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../services/axiosService";
import moment from "moment/moment";
import { LoggedUserContext } from "../../App";

const Customers = () => {
  //meta title
  document.title = "Customers";

  const [customer, setCustomer] = useState();
  const [isLoading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);

  const [user, setUser] = useState();

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (customer && customer.id) || "",
      name: (customer && customer.name) || "",
      phone: (customer && customer.phone) || "",
      openingBalance: (customer && customer.openingBalance) || "",
      branchId: (customer && customer.branch_id) || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Your Name"),
      phone: Yup.string(),
      openingBalance: Yup.number("must enter a number"),
      branchId: Yup.string().required("please select branch"),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        const updatedUser = {
          name: values["name"],
          phone: values["phone"],
          branchId: values["branchId"],
        };

        const customerId = values["id"];

        try {
          const { data } = await axiosInstance.put(
            `customers/${customerId}`,
            updatedUser
          );
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchCustomers();
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
          // branchId: user.branchId,
          branchId: values["branchId"],
        };

        try {
          const { data } = await axiosInstance.post("customers", newVendor);
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchCustomers();
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
  const [customers, setCustomers] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("customers");
      if (data.success) {
        setCustomers(data.customers);
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
    fetchCustomers();
    fetchBranches();
  }, []);

  const onDeleteCustomer = async () => {
    try {
      const { data } = await axiosInstance.delete("customers/" + customer.id);
      if (data.success) {
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchCustomers();
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
        header: "Branch",
        accessorKey: "branch_name",
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
              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  setIsEdit(true);
                  const userData = cellProps.row.original;
                  setCustomer(userData);
                  setIsNewModelOpen(true);
                }}
              >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
              </Link>
              <Link
                to="#"
                className="text-danger"
                onClick={() => {
                  const userData = cellProps.row.original;
                  setCustomer(userData);
                  setDeleteModal(true);
                }}
              >
                <i className="mdi mdi-delete font-size-18" id="deletetooltip" />
              </Link>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        warningText={"Are you sure to delete this customer "}
        boldText={customer?.name}
        onDeleteClick={() => onDeleteCustomer()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="Customers" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={customers || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={true}
                      handleUserClick={() => {
                        setIsEdit(false);
                        setCustomer("");
                        setIsNewModelOpen(!isNewModalOpen);
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Customer"
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
              {!!isEdit ? "Edit Customer" : "Add Customer"}
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
                  <Col lg="12">
                    <div className="mb-3">
                      <Label>Branch</Label>
                      <Input
                        name="branchId"
                        label="Branch"
                        type="select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.branchId || ""}
                        invalid={
                          validation.touched.branchId &&
                          validation.errors.branchId
                            ? true
                            : false
                        }
                      >
                        <option value="">Select type</option>
                        {branches?.map((brn) => {
                          return (
                            <option key={brn.id} value={brn.id}>
                              {brn.branch_name}
                            </option>
                          );
                        })}
                      </Input>
                      {validation.touched.branchId &&
                      validation.errors.branchId ? (
                        <FormFeedback type="invalid">
                          {" "}
                          {validation.errors.branchId}{" "}
                        </FormFeedback>
                      ) : null}
                    </div>
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
                        {!!isEdit ? "Update Customer" : "Add Customer"}{" "}
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

export default Customers;
