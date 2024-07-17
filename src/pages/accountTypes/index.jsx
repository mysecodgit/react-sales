import React, { useEffect, useState, useMemo } from "react";
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
import moment from "moment/moment";
import axiosInstance from "../../services/axiosService";

const AccountTypes = () => {
  //meta title
  document.title = "AccountTypes";

  const [accountType, setAccountType] = useState();
  const [isLoading, setLoading] = useState(true);
  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (accountType && accountType.id) || "",
      typeName: (accountType && accountType.typeName) || "",
      typeStatus: (accountType && accountType.typeStatus) || "",
    },
    validationSchema: Yup.object({
      typeName: Yup.string().required("Please Enter Type Name"),
      typeStatus: Yup.string().required("Please Enter stats"),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        const updatedAccountType = {
          typeName: values["typeName"],
          typeStatus: values["typeStatus"],
        };

        const accountTypeId = values["id"];

        try {
          const { data } = await axiosInstance.put(
            `accountTypes/${accountTypeId}`,
            updatedAccountType
          );
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchAccountTypes();
          } else {
            toast.error("Sorry something went wrong");
          }
        } catch (err) {
          toast.error("Sorry something went wrong");
        }
      } else {
        const newAccountType = {
          typeName: values["typeName"],
          typeStatus: values["typeStatus"],
        };

        try {
          const { data } = await axiosInstance.post(
            "accountTypes",
            newAccountType
          );
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchAccountTypes();
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
  const [accountTypes, setAccountTypes] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchAccountTypes = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("accountTypes");
      if (data.success) {
        setAccountTypes(data.accountTypes);
        console.log(data);

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
    fetchAccountTypes();
  }, []);

  const onDeleteAccountType = async () => {
    try {
      const { data } = await axiosInstance.delete(
        "accountTypes/" + accountType.id
      );
      if (data.success) {
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchAccountTypes();
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
        header: "type",
        accessorKey: "typeName",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Status",
        accessorKey: "typeStatus",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Action",
        cell: (cellProps) => {
          return null;
          return (
            <div className="d-flex gap-3">
              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  setIsEdit(true);
                  const userData = cellProps.row.original;
                  setAccountType(userData);
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
                  setAccountType(userData);
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
        warningText="Are you sure to delete this"
        boldText={accountType?.typeName}
        onDeleteClick={onDeleteAccountType}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="AccountTypes" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={accountTypes || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={true}
                      isAddButton={true}
                      handleUserClick={() => {
                        setIsEdit(false);
                        setAccountType("");
                        setIsNewModelOpen(!isNewModalOpen);
                      }}
                      buttonClass="btn btn-success waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Account Type"
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
              {!!isEdit ? "Edit AccountType" : "Add AccountType"}
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
                      <Label>Account Type Name</Label>
                      <Input
                        name="typeName"
                        type="text"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.typeName || ""}
                        invalid={
                          validation.touched.typeName &&
                          validation.errors.typeName
                            ? true
                            : false
                        }
                      />
                      {validation.touched.typeName &&
                      validation.errors.typeName ? (
                        <FormFeedback type="invalid">
                          {validation.errors.typeName}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>Status</Label>
                      <Input
                        name="typeStatus"
                        label="Status"
                        type="select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.typeStatus || ""}
                        invalid={
                          validation.touched.typeStatus &&
                          validation.errors.typeStatus
                            ? true
                            : false
                        }
                      >
                        <option value="">Select status</option>
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                      </Input>
                      {validation.touched.typeStatus &&
                      validation.errors.typeStatus ? (
                        <FormFeedback type="invalid">
                          {" "}
                          {validation.errors.typeStatus}{" "}
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
                        {!!isEdit ? "Update AccountType" : "Add AccountType"}
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

export default AccountTypes;
