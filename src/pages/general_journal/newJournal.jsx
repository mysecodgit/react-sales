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

const CreateGeneralJournal = () => {
  const { JournalId } = useParams();
  //meta title
  document.title = "Create Journal";

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

  const [JournalDate, setJournalDate] = useState(new Date());

  const [discount, setDiscount] = useState(null);
  const [paid, setPaid] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [memo, setMemo] = useState("");
  const [nextId, setNextId] = useState(JournalId);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);

  const [rows, setRows] = useState([
    { selectedAccount: null, accountId: "", debit: "", credit: "" },
    { selectedAccount: null, accountId: "", debit: "", credit: "" },
  ]);

  const fetchJournalInfo = async (JournalId) => {
    try {
      const { data } = await axiosInstance.post("general_journals/get_by_id", {
        JournalId,
      });
      if (data.success) {
        console.log("journal info ", data);
        setJournalDate(data.journal.date);
        setMemo(data.journal.memo);

        setSelectedBranch({
          label: data.journal.branchName,
          value: data.journal.branchId,
        });

        setRows(
          data.rows.map((row) => ({
            selectedAccount: {
              label: row.accountName,
              value: row.accountId,
            },
            accountId: row.accountId,
            debit: row.debit,
            credit: row.credit,
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
    if (JournalId) {
      fetchJournalInfo(JournalId);
    } else {
      fetchNextId();
    }
  }, [JournalId]);

  const addRow = () => {
    setRows([
      ...rows,
      { selectedAccount: null, accountId: "", debit: "", credit: "" },
    ]);
  };

  const deleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSelectedAccount = (index, account) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      selectedAccount: account,
      accountId: account.value,
    };
    setRows(updatedRows);
  };

  const handleDebitChange = (index, newDebit) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      debit: newDebit,
    };
    setRows(updatedRows);
  };

  const handleCreditChange = (index, newCredit) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      credit: newCredit,
    };
    setRows(updatedRows);
  };

  const fetchAccounts = async () => {
    try {
      const { data } = await axiosInstance.post(
        "general_journals/get_accounts"
      );
      setAccounts(
        data.accounts.map((account) => {
          return { label: account.accountName, value: account.id };
        })
      );
    } catch (error) {
      console.log("Error ", error);
    }
  };

  const fetchNextId = async () => {
    try {
      const { data } = await axiosInstance.post("general_journals/get_next_id");
      if (data.success) {
        setNextId(data.nextId);
      }
    } catch (error) {
      console.log("Error ", error);
    }
  };

  useEffect(() => {
    // fetchBankAccounts();
    fetchAccounts();
    fetchBranches();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="New Journal" />
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
                        if (!JournalDate) return toast.error("Select Date");
                        if (!selectedBranch)
                          return toast.error("Select Branch");

                        const totalDebits = rows.reduce(
                          (a, c) => a + (parseFloat(c.debit) || 0),
                          0
                        );
                        const totalCredits = rows.reduce(
                          (a, c) => a + (parseFloat(c.credit) || 0),
                          0
                        );

                        if (totalDebits != totalCredits)
                          return toast.error(
                            "debitka iyo creditka waa iney iskumid yihiin"
                          );

                        const info = {
                          JournalId,
                          JournalDate: JournalDate,
                          userId: user.id,
                          branchId: selectedBranch.value,
                          memo: memo,
                          rows: rows.map((row) => ({
                            ...row,
                            debit: parseFloat(row.debit) || null,
                            credit: parseFloat(row.credit) || null,
                          })),
                        };

                        if (JournalId) {
                          try {
                            setIsSaving(true);
                            const { data } = await axiosInstance.post(
                              "general_journals/update",
                              info
                            );

                            if (data.success) {
                              setIsSaving(false);
                              navigate("/general_journal", { replace: true });
                              toast.success("Successfull updated");
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
                              "general_journals/create",
                              info
                            );

                            if (data.success) {
                              setIsSaving(false);
                              navigate("/general_journal", { replace: true });
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
                            <Label>Refrence No</Label>
                            <Input
                              type="number"
                              disabled
                              value={nextId}
                              onChange={(e) => {}}
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
                                value={JournalDate}
                                onChange={(e) => {
                                  console.log(e);
                                  const utcDate = moment(e[0]).format(
                                    "YYYY-MM-DD"
                                  );
                                  setJournalDate(utcDate);
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
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Memo</Label>
                            <Input
                              type="text"
                              value={memo}
                              onChange={(e) => setMemo(e.target.value)}
                            />
                          </div>
                        </Col>
                      </Row>
                      <Row>
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
                          <h4 className="card-title mb-3"></h4>
                          <div className="">
                            <Table className="table mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th style={{ width: "5%" }}>#</th>
                                  <th style={{ width: "35%" }}>Account</th>
                                  <th>Debit</th>
                                  <th>Credit</th>
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
                                            value={row.selectedAccount}
                                            onChange={(selected) => {
                                              handleSelectedAccount(
                                                index,
                                                selected
                                              );
                                            }}
                                            options={accounts}
                                            className="select2-selection"
                                          />
                                        </div>
                                      </td>

                                      <td>
                                        <Input
                                          type="number"
                                          value={row.debit}
                                          onChange={(e) =>
                                            handleDebitChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td>
                                        <Input
                                          type="number"
                                          value={row.credit}
                                          onChange={(e) =>
                                            handleCreditChange(
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
                                <tr>
                                  <th scope="row"></th>
                                  <td></td>

                                  <td className="text-end">
                                    <h6>
                                      {rows
                                        .reduce(
                                          (a, c) =>
                                            a + (parseFloat(c.debit) || 0),
                                          0
                                        )
                                        .toFixed(2)}
                                    </h6>
                                  </td>
                                  <td className="text-end">
                                    <h6>
                                      {rows
                                        .reduce(
                                          (a, c) =>
                                            a + (parseFloat(c.credit) || 0),
                                          0
                                        )
                                        .toFixed(2)}
                                    </h6>
                                  </td>
                                  <td></td>
                                </tr>
                              </tbody>
                            </Table>
                            <Button
                              type="submit"
                              color="success"
                              disabled={isSaving}
                              className=" mt-2"
                            >
                              {JournalId ? "Update journal" : "Save journal"}
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

export default CreateGeneralJournal;
