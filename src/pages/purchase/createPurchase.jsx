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

const CreatePurchase = () => {
  const { id } = useParams();
  //meta title
  document.title = "CreatePurchase";

  const [user, setUser] = useState();

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  const [vendors, setVendors] = useState();
  const [products, setProducts] = useState();
  const [branches, setBranches] = useState();
  const [incomeAccounts, setIncomeAccounts] = useState();
  const [bankAccounts, setBankAccounts] = useState();
  let navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedIncomeAccount, setSelectedIncomeAccount] = useState(null);
  const [setlectedBankAccount, setSelectedBankAccount] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [purchaseNo, setPurchaseNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date());

  const [discount, setDiscount] = useState(null);
  const [paid, setPaid] = useState(null);

  const [rows, setRows] = useState([
    {
      selectedProduct: null,
      selectedBranch: null,
      productId: "",
      branchId: "",
      qty: "",
      price: "",
      total: "",
    },
  ]);

  // useEffect(() => {
  //   if (id) {
  //     fetchPurchaseInfo(id);
  //   }
  // }, [id]);

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

  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get("products");
      setProducts(
        data.products.map((product) => {
          return { label: product.name, value: product.id };
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

  const fetchIncomeAccounts = async () => {
    try {
      const { data } = await axiosInstance.get("accounts/get_income_accounts");
      setIncomeAccounts(
        data.incomeAccounts.map((account) => {
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

  const fetchPurchaseInfo = async (id) => {
    try {
      const { data } = await axiosInstance.get("purchases/" + id);
      if (data.success) {
        setPurchaseNo(data.purchaseNo);
        setSelectedVendor({ label: "Vendor 2", value: data.vendorId });
        setPurchaseDate(data.purchaseDate);
        setSelectedIncomeAccount({
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

  useEffect(() => {
    fetchVendors();
    fetchProducts();
    fetchBranches();
    fetchIncomeAccounts();
    fetchBankAccounts();
  }, []);

  const totalPrice = rows.reduce((a, b) => a + b.price * b.qty, 0);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="CreatePurchase" />
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
                        if (!purchaseNo)
                          return toast.error("Enter purchase No");
                        if (!selectedVendor)
                          return toast.error("Select Vendor");
                        if (!purchaseDate) return toast.error("Select Date");
                        // if (discount > 0 && !selectedIncomeAccount)
                        //   return toast.error("Select Discount Account");
                        // if (paid > 0 && !setlectedBankAccount)
                        //   return toast.error("Select payment account");

                        if (totalPrice <= 0)
                          return toast.error(
                            "select products enter qty and price"
                          );

                        const info = {
                          purchaseNo,
                          userId: user.id,
                          branchId: user.branchId,
                          vendorId: selectedVendor.value,
                          purchaseDate,
                          // selectedIncomeAccount:
                          //   selectedIncomeAccount?.value || null,
                          // setlectedBankAccount:
                          //   setlectedBankAccount?.value || null,
                          items: rows,
                          subTotal: totalPrice,
                          // discount: discount || 0,
                          // total: totalPrice - discount,
                          total: totalPrice,
                          paid,
                        };

                        if (id) {
                          return;
                          try {
                            setIsSaving(true);
                            const { data } = await axiosInstance.put(
                              "purchases/" + id,
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
                              "purchases",
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
                        }
                      }}
                    >
                      <h4 className="card-title mb-3">Invoice summary</h4>
                      <Row>
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Purchase No</Label>
                            <Input
                              name="purchaseNo"
                              type="text"
                              value={purchaseNo}
                              onChange={(e) => setPurchaseNo(e.target.value)}
                            />
                          </div>
                        </Col>
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Vendors</Label>
                            <Select
                              name="vendor_id"
                              value={selectedVendor}
                              onChange={setSelectedVendor}
                              options={vendors}
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
                                value={purchaseDate}
                                onChange={(e) => {
                                  const utcDate = moment(e[0])
                                    .utc()
                                    .format("YYYY-MM-DD HH:mm:ss");
                                  setPurchaseDate(utcDate);
                                }}
                                options={{
                                  altInput: true,
                                  altFormat: "j F Y",
                                  dateFormat: "Y-m-d H:i",
                                }}
                              />
                            </InputGroup>
                          </div>
                        </Col>
                      </Row>
                      {/* <Row>
                        <Col lg="3">
                          <div className="mb-3">
                            <Label>Discount Account</Label>
                            <Select
                              name=""
                              value={selectedIncomeAccount}
                              onChange={setSelectedIncomeAccount}
                              options={incomeAccounts}
                              className="select2-selection"
                            />
                          </div>
                        </Col>
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
                      </Row> */}
                      <Row>
                        <Col lg="10">
                          <h4 className="card-title mb-3">Invoice Details</h4>
                          <div className="">
                            <Table className="table mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th style={{ width: "5%" }}>#</th>
                                  <th style={{ width: "25%" }}>Product</th>
                                  <th style={{ width: "20%" }}>Branch</th>
                                  <th style={{ width: "15%" }}>Qty</th>
                                  <th>Cost</th>
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
                                      <td>
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
                                      </td>
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
                            <Button
                              type="submit"
                              color="success"
                              disabled={isSaving}
                              className=" mt-3"
                            >
                              Save Invoice
                            </Button>
                          </div>
                        </Col>
                        <Col lg="2">
                          <Row>
                            <Col lg="6">
                              <h4 className="card-title mb-0 mt-4">Total</h4>
                            </Col>
                            <Col lg="6 text-end">
                              <p className="mb-0 mt-4">$ {totalPrice.toFixed(2)}</p>
                            </Col>
                          </Row>
                          {/* <Row className="align-items-center mb-3">
                            <Col lg="6">
                              <strong>Discount</strong>
                            </Col>
                            <Col lg="6 text-end">
                              <Input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                              />
                            </Col>
                          </Row>
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
                          </Row> */}
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

export default CreatePurchase;
