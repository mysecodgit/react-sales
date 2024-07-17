import React, { useEffect, useState, useMemo, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  InputGroup,
  Table,
} from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";

//Import Breadcrumb
import Breadcrumbs from "/src/components/Common/Breadcrumb";
import DeleteModal from "/src/components/Common/DeleteModal";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../services/axiosService";
import Select from "react-select";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import moment, { utc } from "moment/moment";
import { LoggedUserContext } from "../../App";

const CreateCheck = () => {
  const { checkId } = useParams();
  //meta title
  document.title = "Create Check";

  const [user, setUser] = useState();

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  const [products, setProducts] = useState();
  const [bankAccounts, setBankAccounts] = useState();
  const [parties, setParties] = useState();
  let navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);

  const [setlectedBankAccount, setSelectedBankAccount] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [checkDate, setCheckDate] = useState(new Date());

  const [discount, setDiscount] = useState(null);
  const [paid, setPaid] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);

  const [rows, setRows] = useState([
    { selectedExpenseAccount: null, accountId: "", amount: "", memo: "" },
  ]);

  const fetchCheckInfo = async (checkId) => {
    try {
      const { data } = await axiosInstance.post("checks/get_check_info", {
        checkId,
      });
      if (data.success) {
        setSelectedBankAccount({
          label: data.check.accountName,
          value: data.check.accountId,
        });

        setCheckDate(data.check.date);
        setSelectedParty({
          label: data.check.vendorName || data.check.customerName,
          value: data.check.vendorId || data.check.customerId,
          type: data.check.vendorId ? "vendor" : "customer",
        });

        setSelectedBranch({
          label: data.check.branchName,
          value: data.check.branchId,
        });

        setRows(
          data.rows.map((row) => ({
            selectedExpenseAccount: {
              label: row.accountName,
              value: row.accountId,
            },
            accountId: row.accountId,
            amount: row.amount,
            memo: row.memo,
          }))
        );
      }
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
    if (checkId) {
      fetchCheckInfo(checkId);
    }
  }, [checkId]);

  const addRow = () => {
    setRows([
      ...rows,
      { selectedExpenseAccount: null, accountId: "", amount: "", memo },
    ]);
  };

  const deleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSelectedExpenseAccount = (index, account) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      selectedExpenseAccount: account,
      accountId: account.value,
    };
    setRows(updatedRows);
  };

  const handleAmountChange = (index, newAmount) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      amount: newAmount,
    };
    setRows(updatedRows);
  };

  const handleMemoChange = (index, newMemo) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      memo: newMemo,
    };
    setRows(updatedRows);
  };

  const fetchAccountBalance = async (accountId) => {
    try {
      const { data } = await axiosInstance.get(
        "accounts/" + accountId + "/remaining"
      );
      if (data.success) {
        setAccountBalance(data.balance);
      }
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

  const fetchParties = async () => {
    try {
      const { data } = await axiosInstance.get("checks/get_parties");
      setParties(
        data.parties.map((party) => {
          return { label: party.name, value: party.id, type: party.type };
        })
      );
    } catch (error) {
      console.log("Error ", error);
    }
  };

  const fetchExpenseAccounts = async () => {
    try {
      const { data } = await axiosInstance.get("accounts/get_expense_accounts");
      setExpenseAccounts(
        data.expenseAccounts.map((account) => {
          return { label: account.accountName, value: account.id };
        })
      );
    } catch (error) {
      console.log("Error ", error);
    }
  };

  useEffect(() => {
    if (setlectedBankAccount) {
      fetchAccountBalance(setlectedBankAccount.value);
    }
  }, [setlectedBankAccount]);

  useEffect(() => {
    fetchParties();
    fetchBankAccounts();
    fetchExpenseAccounts();
    fetchBranches();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="New Expense" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <Form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        // validation.handleSubmit();
                        if (!checkDate) return toast.error("Select Date");
                        if (!setlectedBankAccount)
                          return toast.error("Select Bank account");

                        if (!selectedBranch)
                          return toast.error("Select Branch");

                        let vendorId = null,
                          customerId = null;
                        if (selectedParty?.type == "vendor") {
                          vendorId = selectedParty?.value || null;
                        }

                        if (selectedParty?.type == "customer") {
                          customerId = selectedParty?.value || null;
                        }

                        const info = {
                          checkId,
                          checkDate: checkDate,
                          branchId: selectedBranch.value,
                          bankAccountId: setlectedBankAccount.value,
                          vendorId,
                          customerId,
                          userId: user.id,
                          expenses: rows,
                          amount: rows.reduce(
                            (a, c) => a + parseFloat(c.amount || 0),
                            0
                          ),
                        };

                        if (checkId) {
                          try {
                            setIsSaving(true);
                            const { data } = await axiosInstance.post(
                              "checks/update_check",
                              info
                            );

                            if (data.success) {
                              setIsSaving(false);
                              navigate("/checks", { replace: true });
                              toast.success("Successfull created");
                            } else {
                              setIsSaving(false);
                              toast.error("Something went wrong");
                            }
                          } catch (err) {
                            setIsSaving(false);
                            toast.error("Something went wrong");
                          }
                        } else {
                          try {
                            setIsSaving(true);
                            const { data } = await axiosInstance.post(
                              "checks",
                              info
                            );

                            if (data.success) {
                              setIsSaving(false);
                              navigate("/checks", { replace: true });
                              toast.success("Successfull created");
                            } else {
                              setIsSaving(false);
                              toast.error("Something went wrong");
                            }
                          } catch (err) {
                            setIsSaving(false);
                            toast.error("Something went wrong");
                          }
                        }
                      }}
                    >
                      {/* <h4 className="card-title mb-3">Invoice summary</h4> */}
                      <Row>
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Bank Account</Label>
                            <Select
                              name=""
                              value={setlectedBankAccount}
                              onChange={setSelectedBankAccount}
                              options={bankAccounts}
                              className="select2-selection"
                            />
                          </div>
                        </Col>
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Date</Label>
                            <InputGroup>
                              <Flatpickr
                                className="form-control d-block"
                                placeholder="dd M,yyyy"
                                value={checkDate}
                                onChange={(e) => {
                                  const utcDate = moment(e[0]).format(
                                    "YYYY-MM-DD"
                                  );
                                  setCheckDate(utcDate);
                                }}
                                options={{
                                  altInput: true,
                                  altFormat: "j F Y",
                                  dateFormat: "Y-m-d",
                                }}
                              />
                            </InputGroup>
                          </div>
                        </Col>
                        <Col>
                          {accountBalance && (
                            <h1
                              className={
                                accountBalance <= 0
                                  ? "text-danger"
                                  : "text-success"
                              }
                            >
                              {!checkId && "$ "}
                              {!checkId &&
                                accountBalance -
                                  rows.reduce(
                                    (a, c) => a + parseFloat(c.amount || 0),
                                    0
                                  )}
                            </h1>
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Pay To</Label>
                            <Select
                              name=""
                              value={selectedParty}
                              onChange={setSelectedParty}
                              options={parties}
                              className="select2-selection"
                            />
                          </div>
                        </Col>
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Branch</Label>
                            <Select
                              name=""
                              value={selectedBranch}
                              onChange={setSelectedBranch}
                              options={branches}
                              className="select2-selection"
                            />
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col lg="9">
                          <h4 className="card-title mb-3">Expenses</h4>
                          <div className="">
                            <Table className="table mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th style={{ width: "5%" }}>#</th>
                                  <th style={{ width: "35%" }}>Account</th>
                                  <th>Amount</th>
                                  <th>memo</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row, index) => {
                                  return (
                                    <tr key={index}>
                                      <th scope="row">{index + 1}</th>
                                      <td>
                                        <div className="">
                                          <Select
                                            value={row.selectedExpenseAccount}
                                            onChange={(selected) => {
                                              handleSelectedExpenseAccount(
                                                index,
                                                selected
                                              );
                                            }}
                                            options={expenseAccounts}
                                            className="select2-selection"
                                          />
                                        </div>
                                      </td>

                                      <td>
                                        <Input
                                          type="number"
                                          value={row.amount}
                                          onChange={(e) =>
                                            handleAmountChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td>
                                        <Input
                                          type="text"
                                          value={row.memo}
                                          onChange={(e) =>
                                            handleMemoChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td>
                                        {index == 0 ? (
                                          <Button
                                            type="button"
                                            color="primary"
                                            className=""
                                            onClick={addRow}
                                          >
                                            <i className="bx bx-plus label-icon"></i>{" "}
                                          </Button>
                                        ) : (
                                          <Button
                                            type="button"
                                            color="danger"
                                            className=""
                                            onClick={() => deleteRow(index)}
                                          >
                                            <i className="bx bx-minus label-icon"></i>{" "}
                                          </Button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                            <Button
                              type="submit"
                              color="success"
                              disabled={isSaving}
                              className=" mt-2"
                            >
                              {checkId ? "Update Expense" : "Save Expense"}
                            </Button>
                          </div>
                        </Col>
                        <Col lg="3"></Col>
                      </Row>
                    </Form>
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

export default CreateCheck;
