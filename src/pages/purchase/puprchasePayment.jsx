import React, { useEffect, useState, useMemo, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Badge,
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
import Select from "react-select";
import "./reactSelectFix.css";
import { LoggedUserContext } from "../../App";

const PurchasePayment = () => {
  //meta title
  document.title = "Purchase Payment";
  const [user, setUser] = useState();

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  const [vendors, setVendors] = useState();
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [invoices, setInvoices] = useState();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [purchase, setPurchase] = useState();
  const [isLoading, setLoading] = useState(false);
  const [remainingBalance, setRemainingBalance] = useState(null);
  const [paidAmount, setPaidAmount] = useState(null);

  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (purchase && purchase._id) || "",
      name: (purchase && purchase.name) || "",
      //   image: (purchase && purchase.image) || "", will come to it later
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Product Name"),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        const updatedProduct = {
          userId: user.id,
          name: values["name"],
        };

        const purchaseId = values["id"];

        try {
          const { data } = await axiosInstance.put(
            `purchasePayments/${purchaseId}`,
            updatedProduct
          );
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchPurchasePayments();
          } else {
            toast.error("Sorry something went wrong");
          }
        } catch (err) {
          toast.error("Sorry something went wrong");
        }
      } else {
        const newProduct = {
          name: values["name"],
        };

        try {
          const { data } = await axiosInstance.post(
            "purchasePayments",
            newProduct
          );
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchPurchasePayments();
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

  const [purchaseId, setPurchaseId] = useState(null);
  const [isNewModalOpen, setIsNewModelOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [purchasePayments, setPurchasePayments] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const [bankAccounts, setBankAccounts] = useState();
  const [setlectedBankAccount, setSelectedBankAccount] = useState(null);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);

  const fetchPurchasePayments = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("purchasePayments");
      if (data.success) {
        setPurchasePayments(data.purchasePayments);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data } = await axiosInstance.get("vendors");
      setVendors(
        data.vendors.map((vendor) => {
          return { label: vendor.name, value: vendor.id };
        })
      );
    } catch (error) {
      console.log("Error ", error);
    }
  };

  const fetchInvoices = async (vendorId) => {
    try {
      const { data } = await axiosInstance.get("purchases/" + vendorId);
      setInvoices(
        data.invoices.map((invoice) => {
          return {
            label: invoice.purchaseNo,
            value: invoice.id,
            balance: invoice.balance,
          };
        })
      );
    } catch (error) {
      console.log("Error ", error);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const { data } = await axiosInstance.get("accounts/get_bank_accounts");
      setBankAccounts(
        data.bankAccounts.map((account) => {
          return { label: account.accountName, value: account.id };
        })
      );
    } catch (error) {
      console.log("Error ", error);
    }
  };

  const fetchRemainingBalance = async (purchaseId) => {
    try {
      const { data } = await axiosInstance.get(
        "purchases/" + purchaseId + "/remaining"
      );
      setRemainingBalance(data.balance);
    } catch (error) {
      console.log("Error ", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await axiosInstance.get("branches");
      setBranches(
        data.branches.map((branch) => {
          return { label: branch.branch_name, value: branch.id };
        })
      );
    } catch (error) {
      console.log("Error ", error);
    }
  };

  useEffect(() => {
    if (selectedVendor) {
      fetchInvoices(selectedVendor.value);
    }
  }, [selectedVendor]);

  useEffect(() => {
    if (selectedInvoice) {
      // set remaining balance input to balance
      setRemainingBalance(selectedInvoice.balance);
    }
  }, [selectedInvoice]);

  useEffect(() => {
    fetchPurchasePayments();
    fetchVendors();
    fetchBankAccounts();
    fetchBranches();
  }, []);

  let navigate = useNavigate();

  const onDeletePayment = async () => {
    try {
      const { data } = await axiosInstance.post(
        "purchasePayments/delete_purchase_payment",
        {
          paymentId: purchaseId,
          userId: user.id,
        }
      );
      if (data.success) {
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchPurchasePayments();
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
        header: "Purchas No",
        accessorKey: "purchaseNo",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          const formattedDate = moment(cell.row.original.createdAt).format(
            "D MMM YY h:mm A"
          );
          return <>{formattedDate}</>;
        },
      },
      {
        header: "Vendor",
        accessorKey: "vendorName",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Account",
        accessorKey: "accountName",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Amount",
        accessorKey: "amount",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          return <>$ {cell.row.original.amount}</>;
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
                  setPurchaseId(cellProps.row.original.id);
                  setSelectedVendor({
                    label: cellProps.row.original.vendorName,
                    value: cellProps.row.original.vendorId,
                  });

                  setSelectedBranch({
                    label: cellProps.row.original.branchName,
                    value: cellProps.row.original.branchId,
                  });

                  fetchRemainingBalance(cellProps.row.original.purchaseId);

                  setSelectedInvoice({
                    label: cellProps.row.original.purchaseNo,
                    value: cellProps.row.original.purchaseId,
                  });

                  setPaidAmount(cellProps.row.original.amount);
                  setSelectedBankAccount({
                    label: cellProps.row.original.accountName,
                    value: cellProps.row.original.accountId,
                  });
                  setIsNewModelOpen(true);
                }}
              >
                <Button type="button" color="success" className="btn-sm">
                  Edit
                </Button>
              </Link>
              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  setPurchaseId(cellProps.row.original.id);
                  setDeleteModal(true);
                }}
              >
                <Button type="button" color="danger" className="btn-sm">
                  Delete
                </Button>
              </Link>
            </div>
          );
        },
      },
    ],
    []
  );

  const selectStyles = {
    menu: (base) => ({
      ...base,
      zIndex: 100,
    }),
  };

  const resetForm = () => {
    setSelectedVendor(null);
    setSelectedInvoice(null);
    setSelectedBankAccount(null);
    setPaidAmount("");
    setSelectedBranch(null);
  };

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        warningText={"Are you sure to delete this payment?"}
        onDeleteClick={() => onDeletePayment()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="Purchase Payment" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={purchasePayments || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={true}
                      handleUserClick={() => {
                        setIsEdit(false);
                        setIsNewModelOpen(true);
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Purchase Payment"
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
            toggle={() => {
              resetForm();
              setIsNewModelOpen(!isNewModalOpen);
            }}
          >
            <ModalHeader
              toggle={() => {
                resetForm();
                setIsNewModelOpen(!isNewModalOpen);
              }}
              tag="h4"
            >
              {!!isEdit ? "Edit Payment" : "Add Payment"}
            </ModalHeader>
            <ModalBody>
              <Form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (!selectedVendor) return toast.error("Select vendor");
                  if (!selectedInvoice)
                    return toast.error("Select purchase invoice");
                  if (parseFloat(paidAmount) <= 0)
                    return toast.error("Enter paid amount");
                  //   if (parseFloat(paidAmount) > parseFloat(remainingBalance))
                  //     return toast.error(
                  //       "Paid amount can not be greater than balance"
                  //     );
                  if (!setlectedBankAccount)
                    return toast.error("Select account");
                  // if (!selectedBranch) return toast.error("Select branch");

                  const newPayment = {
                    userId: user.id,
                    // branchId: user.branchId,
                    // branchId: selectedBranch.value,
                    branchId: null,
                    vendorId: selectedVendor.value,
                    purchaseId: selectedInvoice.value,
                    paidAmount: paidAmount,
                    accountId: setlectedBankAccount.value,
                  };

                  if (isEdit) {
                    try {
                      const { data } = await axiosInstance.put(
                        "purchasePayments/" + purchaseId,
                        newPayment
                      );
                      if (data.success) {
                        toast.success(data.message);
                        setIsNewModelOpen(false);
                        fetchPurchasePayments();
                        resetForm();
                      } else {
                        toast.error("something went wrong");
                      }
                    } catch (err) {
                      toast.error("something went wrong");
                    }
                  } else {
                    try {
                      const { data } = await axiosInstance.post(
                        "purchasePayments",
                        newPayment
                      );
                      if (data.success) {
                        toast.success(data.message);
                        setIsNewModelOpen(false);
                        fetchPurchasePayments();
                        resetForm();
                      } else {
                        toast.error("something went wrong");
                      }
                    } catch (err) {
                      toast.error("something went wrong");
                    }
                  }
                }}
              >
                <Row>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Vendors</Label>
                      <Select
                        name="vendor_id"
                        styles={selectStyles}
                        value={selectedVendor}
                        onChange={setSelectedVendor}
                        options={vendors}
                        className="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Invoices</Label>
                      <Select
                        name="invoice"
                        styles={selectStyles}
                        value={selectedInvoice}
                        onChange={setSelectedInvoice}
                        options={invoices}
                        className="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  {/* <Col lg="6">
                    <div className="mb-3">
                      <Label>Remaining Balance</Label>
                      <Input
                        name="remaining"
                        type="number"
                        disabled={true}
                        value={remainingBalance}
                        onChange={() => {}}
                      />
                    </div>
                  </Col> */}
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Account</Label>
                      <Select
                        name=""
                        value={setlectedBankAccount}
                        onChange={setSelectedBankAccount}
                        options={bankAccounts}
                        styles={selectStyles}
                        className="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Paid</Label>
                      <Input
                        name="paid"
                        type="number"
                        min={0}
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                      />
                    </div>
                  </Col>
                </Row>
                {/* <Row>
                  <Col lg="12">
                    <div className="mb-3">
                      <Label>Branch</Label>
                      <Select
                        name=""
                        value={selectedBranch}
                        onChange={setSelectedBranch}
                        options={branches}
                        styles={selectStyles}
                        className="select2-selection"
                      />
                    </div>
                  </Col>
                </Row> */}
                <Row>
                  <Col>
                    <div className="text-end">
                      <Button
                        type="submit"
                        color="success"
                        className="save-user"
                      >
                        {!!isEdit ? "Update Payment" : "Add Payment"}{" "}
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

export default PurchasePayment;
