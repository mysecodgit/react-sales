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

const MakeAdjustment = () => {
  const { checkId } = useParams();
  //meta title
  document.title = "Create Adjustment";

  const [user, setUser] = useState();

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  const [products, setProducts] = useState();
  const [branchProducts, setBranchProducts] = useState();
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
  const [incomeAccounts, setIncomeAccounts] = useState([]);

  const [adjustmentAccounts, setAdjustmentAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState();

  const [adjustmentType, setAdjustmentType] = useState({
    label: "quantity",
    value: "q",
  });

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);

  const [rows, setRows] = useState([
    {
      selectedProduct: null,
      selectedBranch: null,
      productId: "",
      qtyOnHand: "",
      newQty: "",
      difference: "",
      avgCost: "",
      totalValue: "",
      newValue: "",
      total: 0,
    },
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
        });

        setRows(
          data.rows.map((row) => ({
            selectedExpenseAccount: {
              label: row.accountName,
              value: row.accountId,
            },
            accountId: row.accountId,
            amount: row.amount,
          }))
        );
      }
    } catch (error) {
      console.log("Error ", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get("products");
      setProducts(
        data.products.map((product) => {
          return {
            label: product.name,
            value: product.id,
            qtyOnHand: product.qtyOnHand,
            avgCost: product.avgCost,
          };
        })
      );
    } catch (error) {
      console.log("Error ", error);
    }
  };

  const fetchProductsByBranchId = async (branchId) => {
    try {
      const { data } = await axiosInstance.post("products/get_by_branch_id", {
        branchId,
      });

      setBranchProducts(
        data.products.map((product) => {
          return {
            label: product.name,
            value: product.id,
            qtyOnHand: product.qtyOnHand,
            avgCost: product.avgCost,
          };
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
    if (checkId) {
      fetchCheckInfo(checkId);
    }
  }, [checkId]);

  useEffect(() => {
    if (selectedBranch) {
      fetchProductsByBranchId(selectedBranch.value);
    }
  }, [selectedBranch]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        selectedProduct: null,
        selectedBranch: null,
        productId: "",
        qtyOnHand: "",
        newQty: "",
        difference: "",
        avgCost: "",
        totalValue: "",
        newValue: "",
        total: 0,
      },
    ]);
  };

  function roundToNearestCents(num, cent) {
    const decimal = num - Math.floor(num);
    let roundedDecimal;

    if (decimal < parseFloat(`0.${cent}25`)) {
      roundedDecimal = parseFloat(`0.${cent}0`);
    } else if (decimal < parseFloat(`0.${cent}75`)) {
      roundedDecimal = parseFloat(`0.${cent}5`);
    } else {
      roundedDecimal = parseFloat(`0.${cent + 1}0`);
    }

    return Math.floor(num) + roundedDecimal;
  }

  const deleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSelectedProduct = (index, product) => {
    const updatedRows = [...rows];
    const totalValue = product.qtyOnHand * parseFloat(product.avgCost);
    updatedRows[index] = {
      ...updatedRows[index],
      selectedProduct: product,
      productId: product.value,
      qtyOnHand: product.qtyOnHand,
      avgCost: product.avgCost,
      totalValue:
        roundToNearestCents(totalValue, totalValue.toString()[2]).toFixed(2) ||
        "",
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

  function countOccurrences(number, n2) {
    if (n2 == 0) return 0;
    return number / n2;
  }

  const handleNewValueChange = (index, newValue) => {
    const updatedRows = [...rows];
    const diff = (newValue - updatedRows[index].totalValue).toFixed(2);
    updatedRows[index] = {
      ...updatedRows[index],
      newValue: newValue,
      difference: newValue.length > 0 ? diff : "",
    };

    setRows(updatedRows);
  };

  const handleNewQtyChange = (index, newQty) => {
    const updatedRows = [...rows];
    const d = newQty - updatedRows[index].qtyOnHand;
    const tt = updatedRows[index].qtyOnHand * updatedRows[index].avgCost;
    const roundedTT = roundToNearestCents(tt, parseInt(tt.toString()[2]));
    // tt -> unrounded total roundedTT - rounded total
    // ttdif -> the diffrence between the two totals
    const ttdif = tt - roundedTT;
    const afterdiff = ttdif.toFixed(2) / 2;

    let rowTotalResult = 0;
    if (d == -1) {
      rowTotalResult = parseFloat(
        (parseFloat(d) * parseFloat(updatedRows[index].avgCost)).toFixed(2)
      );
    } else if (d == -updatedRows[index].qtyOnHand) {
      rowTotalResult =
        parseFloat(ttdif.toFixed(2)) +
        parseFloat(
          (parseFloat(d) * parseFloat(updatedRows[index].avgCost)).toFixed(2)
        );
    } else if (d > 0) {
      if (d < updatedRows[index].qtyOnHand) {
        const ttdif = roundedTT - tt;
        const afterdiff = ttdif.toFixed(2) / 2;
        rowTotalResult =
          afterdiff +
          parseFloat(
            (parseFloat(d) * parseFloat(updatedRows[index].avgCost)).toFixed(2)
          );
      } else {
        const howmuch = countOccurrences(d, updatedRows[index].qtyOnHand);
        console.log("how much ", howmuch);
        const ttdif = roundedTT - tt;
        const afterdiff = parseFloat(ttdif.toFixed(2)) * howmuch;
        rowTotalResult =
          afterdiff +
          parseFloat(
            (parseFloat(d) * parseFloat(updatedRows[index].avgCost)).toFixed(2)
          );
      }
    } else {
      rowTotalResult =
        afterdiff +
        parseFloat(
          (parseFloat(d) * parseFloat(updatedRows[index].avgCost)).toFixed(2)
        );
    }

    updatedRows[index] = {
      ...updatedRows[index],
      newQty: newQty,
      difference: newQty.length > 0 ? d : "",
      total: newQty.length > 0 ? rowTotalResult : 0,
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
      //   setExpenseAccounts(
      //     data.expenseAccounts.map((account) => {
      //       return { label: account.accountName, value: account.id };
      //     })
      //   );

      return data.expenseAccounts.map((account) => {
        return {
          label: account.accountName,
          value: account.id,
          type: "expense",
        };
      });
    } catch (error) {
      console.log("Error ", error);
    }
  };

  const fetchIncomeAccounts = async () => {
    try {
      const { data } = await axiosInstance.get("accounts/get_income_accounts");
      //   setIncomeAccounts(
      //     data.incomeAccounts.map((account) => {
      //       return { label: account.accountName, value: account.id };
      //     })
      //   );

      return data.incomeAccounts.map((account) => {
        return {
          label: account.accountName,
          value: account.id,
          type: "income",
        };
      });
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
    fetchBranches();
    // fetchParties();
    fetchBankAccounts();
    fetchProducts();

    Promise.all([fetchExpenseAccounts(), fetchIncomeAccounts()])
      .then((res) => {
        const newARR = [...res[0], ...res[1]];
        setAdjustmentAccounts(newARR);
      })
      .catch((err) => console.log("promise all err ", err));
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="New Adjustment" />
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
                        if (!selectedAccount)
                          return toast.error("Select Adjustment account");

                        if (adjustmentType.value == "q" && !selectedBranch)
                          return toast.error("Select Branch");

                        for (const row of rows) {
                          if (adjustmentType.value == "q") {
                            if (row.total == "" || row.total == 0)
                              return toast.error("fill product info");

                            if (
                              selectedAccount.type == "expense" &&
                              row.total > 0
                            )
                              return toast.error("qasaaro kaliya diiwan gali");

                            if (
                              selectedAccount.type == "income" &&
                              row.total < 0
                            )
                              return toast.error("income kaliya diiwan gali");
                          } else {
                            if (
                              selectedAccount.type == "expense" &&
                              row.difference > 0
                            )
                              return toast.error("qasaaro kaliya diiwan gali");

                            if (
                              selectedAccount.type == "income" &&
                              row.difference < 0
                            )
                              return toast.error("income kaliya diiwan gali");
                          }
                        }

                        const info = {
                          date: checkDate,
                          branchId: selectedBranch?.value,
                          adjustmentType: adjustmentType.label,
                          adjustmentAccount: selectedAccount.value,
                          adjustmentAmount: rows
                            .reduce((a, c) => a + parseFloat(c.total), 0)
                            .toFixed(2),
                          userId: user.id,
                          rows,
                        };

                        if (adjustmentType.value == "q") {
                          try {
                            setIsSaving(true);
                            const { data } = await axiosInstance.post(
                              "adjustments/create_qty_adj",
                              info
                            );

                            if (data.success) {
                              setIsSaving(false);
                              navigate("/adjustments", { replace: true });
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
                              "adjustments/create_value_adj",
                              info
                            );

                            if (data.success) {
                              setIsSaving(false);
                              navigate("/adjustments", { replace: true });
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
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Type</Label>
                            <Select
                              name=""
                              value={adjustmentType}
                              onChange={(selected) => {
                                setRows([
                                  {
                                    selectedProduct: null,
                                    productId: "",
                                    qtyOnHand: "",
                                    newQty: "",
                                    difference: "",
                                    avgCost: "",
                                    totalValue: "",
                                    newValue: "",
                                    total: 0,
                                  },
                                ]);
                                setAdjustmentType(selected);
                              }}
                              options={[
                                { label: "quantity", value: "q" },
                                { label: "value", value: "v" },
                              ]}
                              className="select2-selection"
                            />
                          </div>
                        </Col>
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Adjustment Account</Label>
                            <Select
                              name=""
                              value={selectedAccount}
                              onChange={setSelectedAccount}
                              options={adjustmentAccounts}
                              className="select2-selection"
                            />
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        {adjustmentType.value == "q" && (
                          <Col lg="3">
                            <div className="mb-3">
                              <Select
                                name=""
                                value={selectedBranch}
                                onChange={(selected) => {
                                  setRows([
                                    {
                                      selectedProduct: null,
                                      productId: "",
                                      qtyOnHand: "",
                                      newQty: "",
                                      difference: "",
                                      avgCost: "",
                                      totalValue: "",
                                      newValue: "",
                                      total: 0,
                                    },
                                  ]);
                                  setSelectedBranch(selected);
                                }}
                                options={branches}
                                className="select2-selection"
                              />
                            </div>
                          </Col>
                        )}
                      </Row>

                      {adjustmentType.value == "q" ? (
                        <Row>
                          <Col lg="9">
                            <h4 className="card-title mb-3">Quantity Adjust</h4>
                            <div className="">
                              <Table className="table mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th style={{ width: "5%" }}>#</th>
                                    <th style={{ width: "30%" }}>Product</th>
                                    <th>Qty On Hand</th>
                                    <th>New Qty</th>
                                    <th>Difference</th>
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
                                              value={row.selectedProduct}
                                              onChange={(selected) => {
                                                handleSelectedProduct(
                                                  index,
                                                  selected
                                                );
                                              }}
                                              options={branchProducts}
                                              className="select2-selection"
                                            />
                                          </div>
                                        </td>

                                        <td>
                                          <Input
                                            type="number"
                                            disabled={true}
                                            value={row.qtyOnHand}
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
                                            type="number"
                                            value={row.newQty}
                                            onChange={(e) =>
                                              handleNewQtyChange(
                                                index,
                                                e.target.value
                                              )
                                            }
                                          />
                                        </td>
                                        <td>
                                          <Input
                                            type="number"
                                            disabled={true}
                                            value={row.difference}
                                            onChange={(e) =>
                                              handleAmountChange(
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
                                {checkId
                                  ? "Update adjustment"
                                  : "Save adjustment"}
                              </Button>
                            </div>
                          </Col>
                          <Col lg="3">
                            <h4>Total adjust</h4>
                            <p>
                              {rows
                                .reduce((a, c) => a + parseFloat(c.total), 0)
                                .toFixed(2)}
                            </p>
                          </Col>
                        </Row>
                      ) : (
                        <Row>
                          <Col lg="9">
                            <h4 className="card-title mb-3">Value Adjust</h4>
                            <div className="">
                              <Table className="table mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th style={{ width: "5%" }}>#</th>
                                    <th style={{ width: "35%" }}>Product</th>
                                    <th>Total Value</th>
                                    <th>New Value</th>
                                    <th>Difference</th>
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
                                              value={row.selectedProduct}
                                              onChange={(selected) => {
                                                handleSelectedProduct(
                                                  index,
                                                  selected
                                                );
                                              }}
                                              options={products}
                                              className="select2-selection"
                                            />
                                          </div>
                                        </td>

                                        <td>
                                          <Input
                                            type="number"
                                            disabled={true}
                                            value={row.totalValue}
                                            onChange={() => {}}
                                          />
                                        </td>
                                        <td>
                                          <Input
                                            type="number"
                                            value={row.newValue}
                                            onChange={(e) =>
                                              handleNewValueChange(
                                                index,
                                                e.target.value
                                              )
                                            }
                                          />
                                        </td>
                                        <td>
                                          <Input
                                            type="number"
                                            disabled={true}
                                            value={row.difference}
                                            onChange={(e) =>
                                              handleAmountChange(
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
                                {checkId
                                  ? "Update adjustment"
                                  : "Save adjustment"}
                              </Button>
                            </div>
                          </Col>
                          <Col lg="3">
                            <h4>Total adjust</h4>
                            <p>
                              {rows
                                .reduce(
                                  (a, c) => a + parseFloat(c.difference || 0),
                                  0
                                )
                                .toFixed(2)}
                            </p>
                          </Col>
                        </Row>
                      )}
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

export default MakeAdjustment;
