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
  Input,
  Form,
  Button,
  InputGroup,
} from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "/src/components/Common/Breadcrumb";
import DeleteModal from "/src/components/Common/DeleteModal";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../services/axiosService";
import moment from "moment/moment";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { LoggedUserContext } from "../../App";
import { UrlActionContext } from "../../App";

const MoneyTransfer = () => {
  //meta title
  document.title = "Transfer money";

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

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  const [isLoading, setLoading] = useState(false);

  const [transfer, setTransfer] = useState(null);

  const [amount, setAmount] = useState(null);
  const [transferDate, setTransferDate] = useState(new Date());
  const [isNewModalOpen, setIsNewModelOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [moneyTransfers, setMoneyTransfers] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const [bankAccounts, setBankAccounts] = useState();
  const [selectedFromAccount, setSelectedFromAccount] = useState(null);
  const [selectedToAccount, setSelectedToAccount] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);

  const [transferId, setTransferId] = useState(null);

  const fetchMoneyTransfers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post(
        "accounts/get_money_transfers",
        {}
      );
      if (data.success) {
        setMoneyTransfers(data.transfers);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
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
    fetchMoneyTransfers();
    fetchBankAccounts();
    fetchBranches();
  }, []);

  let navigate = useNavigate();

  const onCancelTransfer = async () => {
    try {
      const { data } = await axiosInstance.post(
        "accounts/cancel_money_transfers",
        {
          transferId,
          userId: user.id,
        }
      );
      if (data.success) {
        toast.success("Succefully Cancelled");
        setDeleteModal(false);
        fetchMoneyTransfers();
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
        header: "Date",
        accessorKey: "date",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          const date = cell.row.original.date.split("T");
          return <>{date[0]}</>;
        },
      },
      {
        header: "Amount",
        accessorKey: "amount",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          const amount = cell.row.original.amount;
          return <>$ {amount}</>;
        },
      },
      {
        header: "From",
        accessorKey: "fromAccount",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "To",
        accessorKey: "toAccount",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "User",
        accessorKey: "username",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Branch",
        accessorKey: "branchName",
        enableColumnFilter: false,
        enableSorting: true,
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
                    setTransferId(cellProps.row.original.id);

                    setAmount(cellProps.row.original.amount);

                    setSelectedFromAccount({
                      label: cellProps.row.original.fromAccount,
                      value: cellProps.row.original.fromAccountId,
                    });

                    setSelectedToAccount({
                      label: cellProps.row.original.toAccount,
                      value: cellProps.row.original.toAccountId,
                    });

                    setSelectedBranch({
                      label: cellProps.row.original.branchName,
                      value: cellProps.row.original.branchId,
                    });

                    setIsNewModelOpen(true);
                  }}
                >
                  <Button type="button" color="success" className="btn-sm">
                    Edit
                  </Button>
                </Link>
              )}
              {urlActions.includes("delete") && (
                <Link
                  to="#"
                  className="text-success"
                  onClick={() => {
                    setTransferId(cellProps.row.original.id);
                    setDeleteModal(true);
                  }}
                >
                  <Button type="button" color="danger" className="btn-sm">
                    Delete
                  </Button>
                </Link>
              )}
            </div>
          );
        },
      },
    ],
    [urlActions]
  );

  const selectStyles = {
    menu: (base) => ({
      ...base,
      zIndex: 100,
    }),
  };

  const resetForm = () => {
    setSelectedFromAccount(null);
    setSelectedToAccount(null);
    setAmount("");
    setTransferDate(new Date());
    setSelectedBranch(null);
  };

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        warningText={"Are you sure to cancel this transfer?"}
        onDeleteClick={() => onCancelTransfer()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="Money Transfer" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={moneyTransfers || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={urlActions.includes("create")}
                      handleUserClick={() => {
                        setIsEdit(false);
                        resetForm();
                        setIsNewModelOpen(true);
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Transfer"
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
              {!!isEdit ? "Edit Transfer" : "Add Transfer"}
            </ModalHeader>
            <ModalBody>
              <Form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (!selectedFromAccount)
                    return toast.error("Select From account");
                  if (!selectedToAccount)
                    return toast.error("Select To Account");
                  if (parseFloat(amount) <= 0)
                    return toast.error("Enter amount");

                  if (!transferDate) return toast.error("Enter date");

                  if (!selectedBranch) return toast.error("Select Branch");

                  const transferData = {
                    transferId,
                    fromBankAccountId: selectedFromAccount.value,
                    toBankAccountId: selectedToAccount.value,
                    amount: amount,
                    date: transferDate,
                    userId: user.id,
                    branchId: selectedBranch.value,
                  };

                  if (isEdit) {
                    try {
                      const { data } = await axiosInstance.post(
                        "accounts/update_money_transfers",
                        transferData
                      );
                      if (data.success) {
                        toast.success(data.message);
                        setIsNewModelOpen(false);
                        fetchMoneyTransfers();
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
                        "accounts/transfer_money",
                        transferData
                      );
                      if (data.success) {
                        toast.success(data.message);
                        setIsNewModelOpen(false);
                        fetchMoneyTransfers();
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
                      <Label>From Account</Label>
                      <Select
                        name=""
                        value={selectedFromAccount}
                        onChange={setSelectedFromAccount}
                        options={bankAccounts}
                        styles={selectStyles}
                        className="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>To Account</Label>
                      <Select
                        name=""
                        value={selectedToAccount}
                        onChange={setSelectedToAccount}
                        options={bankAccounts}
                        styles={selectStyles}
                        className="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Amount</Label>
                      <Input
                        name="amount"
                        type="number"
                        min={0}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Date</Label>
                      <InputGroup>
                        <Flatpickr
                          className="form-control d-block"
                          placeholder="dd M,yyyy"
                          value={transferDate}
                          onChange={(e) => {
                            const utcDate = moment(e[0]).format("YYYY-MM-DD");
                            setTransferDate(utcDate);
                          }}
                          defaultValue={new Date()}
                          options={{
                            altInput: true,
                            altFormat: "j F Y",
                            dateFormat: "Y-m-d",
                          }}
                        />
                      </InputGroup>
                    </div>
                  </Col>
                </Row>
                <Row>
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
                </Row>

                <Row>
                  <Col>
                    <div className="text-end">
                      <Button
                        type="submit"
                        color="success"
                        className="save-user"
                      >
                        {!!isEdit ? "Update Transfer" : "Add Transfer"}{" "}
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

export default MoneyTransfer;
