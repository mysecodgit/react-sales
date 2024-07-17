import React, { useEffect, useState, useMemo, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

const CreateSaleReturn = () => {
  const { id } = useParams();
  //meta title
  document.title = "Create Sale Return";

  const [user, setUser] = useState();

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  const [purchase, setSale] = useState();
  const [customers, setCustomers] = useState();
  const [products, setProducts] = useState();
  const [expenseAccounts, setExpenseAccounts] = useState();
  const [bankAccounts, setBankAccounts] = useState();
  let navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);

  const [invoices, setInvoices] = useState();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [branches, setBranches] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedExpenseAccount, setSelectedExpenseAccount] = useState(null);
  const [setlectedBankAccount, setSelectedBankAccount] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [salesNo, setSalesNo] = useState("");
  const [salesDate, setSalesDate] = useState("");

  const [discount, setDiscount] = useState(null);
  const [paid, setPaid] = useState(null);

  const [rows, setRows] = useState([
    {
      selectedProduct: null,
      selectedBranch: null,
      branchId: "",
      productId: "",
      qty: "",
      price: "",
      total: "",
    },
  ]);

  // useEffect(() => {
  //   if (id) {
  //     fetchSaleInfo(id);
  //   }
  // }, [id]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchInvoices(selectedCustomer.value);
    }
  }, [selectedCustomer]);

  const fetchInvoices = async (customerId) => {
    try {
      const { data } = await axiosInstance.get("sales/" + customerId);
      setInvoices(
        data.invoices.map((invoice) => {
          return {
            label: invoice.salesNo,
            value: invoice.id,
            balance: invoice.balance,
          };
        })
      );
    } catch (error) {
      console.log("Error ", error);
    }
  };

  const addRow = () => {
    setRows([
      ...rows,
      { productId: "", branchId: "", qty: "", price: "", total: "" },
    ]);
  };

  const deleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSelectedProduct = (index, product) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      selectedProduct: product,
      productId: product.value,
      qty: 1,
    };
    setRows(updatedRows);
  };

  const handleSelectedBranch = (index, branch) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      selectedBranch: branch,
      branchId: branch.value,
    };
    setRows(updatedRows);
  };

  const handleQtyChange = (index, newQuantity) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      qty: newQuantity,
      total: updatedRows[index].price * newQuantity,
    };
    setRows(updatedRows);
  };

  const handlePriceChange = (index, newPrice) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      price: newPrice,
      total: updatedRows[index].qty * newPrice,
    };
    setRows(updatedRows);
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await axiosInstance.get("customers");
      setCustomers(
        data.customers.map((vendor) => {
          return { label: vendor.name, value: vendor.id };
        })
      );
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
            costPrice: parseFloat(product.avgCost),
          };
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

  const fetchSaleInfo = async (id) => {
    try {
      const { data } = await axiosInstance.get("purchases/" + id);
      if (data.success) {
        setSalesNo(data.salesNo);
        setSelectedCustomer({ label: "Vendor 2", value: data.vendorId });
        setSalesDate(data.salesDate);
        setSelectedExpenseAccount({
          label: data.discountAccountName,
          value: data.discountAccountId,
        });
        setSelectedBankAccount({
          label: data.paidAccountName,
          value: data.paidAccountId,
        });
        setRows(
          data.rows.map((row) => {
            return {
              selectedProduct: { label: row.name, value: row.product_id },
              productId: row.product_id,
              qty: row.qty,
              price: row.price,
              total: row.qty * row.price,
            };
          })
        );
        setDiscount(data.discount);
        setPaid(data.paid);
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
    fetchCustomers();
    fetchProducts();
    fetchBranches();
    fetchExpenseAccounts();
    fetchBankAccounts();
  }, []);

  const totalPrice = rows.reduce((a, b) => a + b.price * b.qty, 0);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="CreateSaleReturn" />
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

                        if (!selectedCustomer)
                          return toast.error("Select Vendor");
                        if (!selectedInvoice)
                          return toast.error("Select Invoice No");
                        if (!salesDate) return toast.error("Select Date");
                        if (!selectedBranch)
                          return toast.error("Select Branch");

                        if (paid > 0 && !setlectedBankAccount)
                          return toast.error("Select payment account");

                        if (totalPrice <= 0)
                          return toast.error(
                            "select products enter qty and price"
                          );

                        const info = {
                          customerId: selectedCustomer.value,
                          userId: user.id,
                          branchId: selectedBranch.value,
                          salesReturnDate: salesDate,
                          selectedInvoice: selectedInvoice?.value || null,
                          setlectedBankAccount:
                            setlectedBankAccount?.value || null,
                          items: rows,
                          total: totalPrice - discount,
                          paid,
                        };

                        if (id) {
                          return;
                          try {
                            return;
                            setIsSaving(true);
                            const { data } = await axiosInstance.put(
                              "sales/" + id,
                              info
                            );

                            if (data.success) {
                              setIsSaving(false);
                              navigate("/purchases", { replace: true });
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
                              "sales/create_sales_return",
                              info
                            );

                            if (data.success) {
                              setIsSaving(false);
                              navigate("/sales-returns", { replace: true });
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
                      <h4 className="card-title mb-3">Invoice summary</h4>
                      <Row>
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Customers</Label>
                            <Select
                              name="vendor_id"
                              value={selectedCustomer}
                              onChange={setSelectedCustomer}
                              options={customers}
                              className="select2-selection"
                            />
                          </div>
                        </Col>
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Invoices</Label>
                            <Select
                              name="vendor_id"
                              value={selectedInvoice}
                              onChange={setSelectedInvoice}
                              options={invoices}
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
                                value={salesDate}
                                onChange={(e) => {
                                  const utcDate = moment(e[0])
                                    .format("YYYY-MM-DD ");
                                  setSalesDate(utcDate);
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
                      </Row>
                      <Row>
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Paid from</Label>
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
                            <Label>Branch</Label>
                            <Select
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
                          <h4 className="card-title mb-3">Invoice Details</h4>
                          <div className="">
                            <Table className="table mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th style={{ width: "5%" }}>#</th>
                                  <th style={{ width: "20%" }}>Product</th>
                                  {/* <th style={{ width: "20%" }}>Branch</th> */}
                                  <th style={{ width: "15%" }}>Qty</th>
                                  <th>Price</th>
                                  <th>Total</th>
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
                                      {/* <td>
                                        <div className="">
                                          <Select
                                            value={row.selectedBranch}
                                            onChange={(selected) => {
                                              handleSelectedBranch(
                                                index,
                                                selected
                                              );
                                            }}
                                            options={branches}
                                            className="select2-selection"
                                          />
                                        </div>
                                      </td> */}
                                      <td>
                                        <Input
                                          type="number"
                                          value={row.qty}
                                          onChange={(e) =>
                                            handleQtyChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td>
                                        <Input
                                          type="number"
                                          value={row.price}
                                          onChange={(e) =>
                                            handlePriceChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td>$ {row.qty * row.price}</td>
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
                          </div>
                        </Col>
                        <Col lg="3">
                          <h4 className="card-title pb-2 mb-2 border-bottom">
                            Totals
                          </h4>
                          <Row>
                            <Col lg="6">
                              <strong>Total</strong>
                            </Col>
                            <Col lg="6 text-end">
                              <p>$ {totalPrice - discount}</p>
                            </Col>
                          </Row>
                          <Row className="align-items-center mb-3">
                            <Col lg="6">
                              <strong>paid</strong>
                            </Col>
                            <Col lg="6 text-end">
                              <Input
                                type="number"
                                value={paid}
                                onChange={(e) => setPaid(e.target.value)}
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col lg="6">
                              <strong>Due</strong>
                            </Col>
                            <Col lg="6 text-end">
                              <p>$ {totalPrice - discount - paid}</p>
                            </Col>
                          </Row>
                          <Button
                            type="submit"
                            color="success"
                            disabled={isSaving}
                            className="w-100 mt-2"
                          >
                            Save Invoice
                          </Button>
                        </Col>
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

export default CreateSaleReturn;
