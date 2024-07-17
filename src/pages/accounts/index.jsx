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
import { LoggedUserContext } from "../../App";

const Accounts = () => {
  //meta title
  document.title = "Accounts";

  const [account, setAccount] = useState();
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState();
  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (account && account.id) || "",
      accountNumber: (account && account.accountNumber) || "",
      accountName: (account && account.accountName) || "",
      accountType: (account && account.typeId) || "",
      openingBalance: (account && account.openingBalance) || "",
    },
    validationSchema: Yup.object({
      accountNumber: Yup.number(),
      accountName: Yup.string().required("Please Enter Account Name"),
      accountType: Yup.number().required("Please Select Account Type"),
      openingBalance: Yup.number().min(1, "must be 1 or greater"),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        const updatedAccount = {
          accountNumber: values["accountNumber"],
          accountName: values["accountName"],
          accountType: values["accountType"],
        };

        const accountId = values["id"];

        try {
          const { data } = await axiosInstance.put(
            `accounts/${accountId}`,
            updatedAccount
          );
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchAccounts();
          } else {
            toast.error("Sorry something went wrong");
          }
        } catch (err) {
          toast.error("Sorry something went wrong");
        }
      } else {
        const newAccount = {
          accountNumber: values["accountNumber"],
          accountName: values["accountName"],
          accountType: values["accountType"],
          openingBalance: values["openingBalance"],
          userId: user.id,
          branchId: user.branchId,
        };

        try {
          const { data } = await axiosInstance.post("accounts", newAccount);
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchAccounts();
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
  const [accounts, setAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("accounts");
      if (data.success) {
        setAccounts(data.accounts);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };

  const fetchAccountTypes = async () => {
    try {
      const { data } = await axiosInstance.get("accountTypes");
      if (data.success) {
        setAccountTypes(data.accountTypes);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchAccountTypes();
    fetchAccounts();
  }, []);

  const onDeleteAccount = async () => {
    try {
      const { data } = await axiosInstance.delete("accounts/" + account.id);
      if (data.success) {
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchAccounts();
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
        header: "Acc No",
        accessorKey: "accountNumber",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Acc Name",
        accessorKey: "accountName",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Acc Type",
        accessorKey: "typeName",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Action",
        cell: (cellProps) => {
          if (cellProps.row.original.isDefault) return null;
          return (
            <div className="d-flex gap-3">
              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  setIsEdit(true);
                  const userData = cellProps.row.original;
                  console.log(userData);
                  setAccount(userData);
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
                  console.log(userData);
                  setAccount(userData);
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
        warningText={"Are you sure to delete this account "}
        boldText={account?.name}
        onDeleteClick={() => onDeleteAccount()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="Accounts" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={accounts || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={true}
                      handleUserClick={() => {
                        setIsEdit(false);
                        setAccount("");
                        setIsNewModelOpen(!isNewModalOpen);
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Account"
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
              {!!isEdit ? "Edit Account" : "Add Account"}
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
                      <Label>Account Number</Label>
                      <Input
                        name="accountNumber"
                        type="number"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.accountNumber || ""}
                        invalid={
                          validation.touched.accountNumber &&
                          validation.errors.accountNumber
                            ? true
                            : false
                        }
                      />
                      {validation.touched.accountNumber &&
                      validation.errors.accountNumber ? (
                        <FormFeedback type="invalid">
                          {validation.errors.accountNumber}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <Row>
                      <Col xs={isEdit ? 12 : 6}>
                        <div className="mb-3">
                          <Label>Account Name</Label>
                          <Input
                            name="accountName"
                            label="Account Name"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.accountName || ""}
                            invalid={
                              validation.touched.accountName &&
                              validation.errors.accountName
                                ? true
                                : false
                            }
                          />
                          {validation.touched.accountName &&
                          validation.errors.accountName ? (
                            <FormFeedback type="invalid">
                              {" "}
                              {validation.errors.accountName}{" "}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </Col>
                      {!isEdit && (
                        <Col xs={6}>
                          <div className="mb-3">
                            <Label>Opening Balance</Label>
                            <Input
                              name="openingBalance"
                              label="Opening Balance"
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
                    <div className="mb-3">
                      <Label>Account Type</Label>
                      <Input
                        name="accountType"
                        label="Account Type"
                        type="select"
                        disabled={isEdit == true}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.accountType || ""}
                        invalid={
                          validation.touched.accountType &&
                          validation.errors.accountType
                            ? true
                            : false
                        }
                      >
                        <option value="">Select type</option>
                        {accountTypes?.map((type) => {
                          return (
                            <option key={type.id} value={type.id}>
                              {type.typeName}
                            </option>
                          );
                        })}
                      </Input>
                      {validation.touched.accountType &&
                      validation.errors.accountType ? (
                        <FormFeedback type="invalid">
                          {" "}
                          {validation.errors.accountType}{" "}
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
                        {!!isEdit ? "Update Account" : "Add Account"}{" "}
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

export default Accounts;
