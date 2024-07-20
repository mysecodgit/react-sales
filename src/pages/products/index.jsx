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
import { LoggedUserContext, UrlActionContext } from "../../App";

const Products = () => {
  //meta title
  document.title = "Products";

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

  const [product, setProduct] = useState();
  const [isLoading, setLoading] = useState(true);
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
      id: (product && product.id) || "",
      name: (product && product.name) || "",
      qtyOnHand: (product && product.qtyOnHand) || "",
      costPrice: (product && product.avgCost) || "",
      sellingPrice: (product && product.sellingPrice) || "",
      incomeAccount: (product && product.incomeAccount) || "",
      assetAccount: (product && product.assetAccount) || "",
      costOfGoodsSoldAccount: (product && product.costOfGoodsSoldAccount) || "",
      //   image: (product && product.image) || "", will come to it later
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Product Name"),
      qtyOnHand: Yup.number().min(1, "Quantity must be 1 or greater"),
      costPrice: Yup.number()
        .min(1, "Cost must be 1 or greater")
        .when("qtyOnHand", (qtyOnHand, schema) => {
          if (qtyOnHand > 0) return schema.required("enter cost price");
          return schema;
        }),
      sellingPrice: Yup.number().min(1, "Selling Price must be 1 or greater"),
      incomeAccount: Yup.number().required("income account required"),
      assetAccount: Yup.number().required("asset account required"),
      costOfGoodsSoldAccount: Yup.number().required(
        "cost of goods sold account required"
      ),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        const updatedProduct = {
          name: values["name"],
          qtyOnHand: values["qtyOnHand"],
          costPrice: values["costPrice"],
          sellingPrice: values["sellingPrice"],
          costOfGoodsSoldAccount: values["costOfGoodsSoldAccount"],
          assetAccount: values["assetAccount"],
          incomeAccount: values["incomeAccount"],
        };

        const productId = product.id;

        try {
          const { data } = await axiosInstance.put(
            `products/${productId}`,
            updatedProduct
          );
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchProducts();
          } else {
            toast.error("Sorry something went wrong");
          }
        } catch (err) {
          toast.error("Sorry something went wrong");
        }
      } else {
        const newProduct = {
          name: values["name"],
          qtyOnHand: values["qtyOnHand"],
          costPrice: values["costPrice"],
          sellingPrice: values["sellingPrice"],
          costOfGoodsSoldAccount: values["costOfGoodsSoldAccount"],
          assetAccount: values["assetAccount"],
          incomeAccount: values["incomeAccount"],
          userId: user.id,
          branchId: user.branchId,
        };

        try {
          const { data } = await axiosInstance.post("products", newProduct);
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchProducts();
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
  const [products, setProducts] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [creationAccounts, setCreationAccounts] = useState([]);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("products");
      if (data.success) {
        setProducts(data.products);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };

  const fetchCreationAccounts = async () => {
    try {
      const { data } = await axiosInstance.get("accounts/product_accounts");
      if (data.success) {
        setCreationAccounts(data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchCreationAccounts();
    fetchProducts();
  }, []);

  const onDeleteProduct = async () => {
    try {
      const { data } = await axiosInstance.delete("products/" + product.id);
      if (data.success) {
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchProducts();
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
        header: "Qty on hand",
        accessorKey: "qtyOnHand",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Average Cost",
        accessorKey: "avgCost",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          return <>$ {cell.row.original.avgCost}</>;
        },
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
                    const userData = cellProps.row.original;
                    setProduct(userData);
                    setIsNewModelOpen(true);
                  }}
                >
                  <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
                </Link>
              )}
              {urlActions.includes("delete") && (
                <Link
                  to="#"
                  className="text-danger"
                  onClick={() => {
                    const userData = cellProps.row.original;
                    setProduct(userData);
                    setDeleteModal(true);
                  }}
                >
                  <i
                    className="mdi mdi-delete font-size-18"
                    id="deletetooltip"
                  />
                </Link>
              )}
            </div>
          );
        },
      },
    ],
    [urlActions]
  );

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        warningText={"Are you sure to delete this product "}
        boldText={product?.name}
        onDeleteClick={() => onDeleteProduct()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="Products" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <>
              <Row>
                <Col lg="12">
                  <Card>
                    <CardBody>
                      <TableContainer
                        columns={columns}
                        data={products || []}
                        isGlobalFilter={true}
                        isPagination={false}
                        SearchPlaceholder="Search..."
                        isCustomPageSize={false}
                        isAddButton={urlActions.includes("create")}
                        handleUserClick={() => {
                          setIsEdit(false);
                          setProduct("");
                          setIsNewModelOpen(!isNewModalOpen);
                        }}
                        buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                        buttonName="New Product"
                        tableClass="align-middle table-nowrap table-hover dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                        theadClass="table-light"
                        paginationWrapper="dataTables_paginate paging_simple_numbers pagination-rounded"
                        pagination="pagination"
                      />
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </>
          )}
          <Modal
            isOpen={isNewModalOpen}
            toggle={() => setIsNewModelOpen(!isNewModalOpen)}
          >
            <ModalHeader
              toggle={() => setIsNewModelOpen(!isNewModalOpen)}
              tag="h4"
            >
              {!!isEdit ? "Edit Product" : "Add Product"}
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
                        autoComplete={false}
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
                    {/* <div className="mb-3">
                      <Label>Location</Label>
                      <Input
                        name="location"
                        label="Location"
                        type="text"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.location || ""}
                        invalid={
                          validation.touched.location &&
                          validation.errors.location
                            ? true
                            : false
                        }
                      />
                      {validation.touched.location &&
                      validation.errors.location ? (
                        <FormFeedback type="invalid">
                          {" "}
                          {validation.errors.location}{" "}
                        </FormFeedback>
                      ) : null}
                    </div> */}
                  </Col>
                </Row>
                <Row>
                  <Col xs={4}>
                    <div className="mb-3">
                      <Label>Qty on Hand</Label>
                      <Input
                        name="qtyOnHand"
                        type="number"
                        autoComplete={false}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.qtyOnHand || ""}
                        disabled={isEdit == true}
                        invalid={
                          validation.touched.qtyOnHand &&
                          validation.errors.qtyOnHand
                            ? true
                            : false
                        }
                      />
                      {validation.touched.qtyOnHand &&
                      validation.errors.qtyOnHand ? (
                        <FormFeedback type="invalid">
                          {validation.errors.qtyOnHand}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="mb-3">
                      <Label>Cost</Label>
                      <Input
                        name="costPrice"
                        type="number"
                        autoComplete={false}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.costPrice || ""}
                        disabled={isEdit == true}
                        invalid={
                          validation.touched.costPrice &&
                          validation.errors.costPrice
                            ? true
                            : false
                        }
                      />
                      {validation.touched.costPrice &&
                      validation.errors.costPrice ? (
                        <FormFeedback type="invalid">
                          {validation.errors.costPrice}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="mb-3">
                      <Label>Selling Price</Label>
                      <Input
                        name="sellingPrice"
                        type="number"
                        autoComplete={false}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.sellingPrice || ""}
                        invalid={
                          validation.touched.sellingPrice &&
                          validation.errors.sellingPrice
                            ? true
                            : false
                        }
                      />
                      {validation.touched.sellingPrice &&
                      validation.errors.sellingPrice ? (
                        <FormFeedback type="invalid">
                          {validation.errors.sellingPrice}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col xs={6}>
                    <div className="mb-3">
                      <Label>Cost of goods</Label>
                      <Input
                        name="costOfGoodsSoldAccount"
                        label="Cost of goods"
                        type="select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.costOfGoodsSoldAccount || ""}
                        invalid={
                          validation.touched.costOfGoodsSoldAccount &&
                          validation.errors.costOfGoodsSoldAccount
                            ? true
                            : false
                        }
                      >
                        <option value="">Select Account</option>
                        {creationAccounts?.cogsAccounts?.map((acc) => {
                          return (
                            <option value={acc.id}>{acc.accountName}</option>
                          );
                        })}
                      </Input>
                      {validation.touched.costOfGoodsSoldAccount &&
                      validation.errors.costOfGoodsSoldAccount ? (
                        <FormFeedback type="invalid">
                          {" "}
                          {validation.errors.costOfGoodsSoldAccount}{" "}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="mb-3">
                      <Label>Income Account</Label>
                      <Input
                        name="incomeAccount"
                        label="Income Account"
                        type="select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.incomeAccount || ""}
                        invalid={
                          validation.touched.incomeAccount &&
                          validation.errors.incomeAccount
                            ? true
                            : false
                        }
                      >
                        <option value="">Select Account</option>
                        {creationAccounts?.incomeAccounts?.map((acc) => {
                          return (
                            <option value={acc.id}>{acc.accountName}</option>
                          );
                        })}
                      </Input>
                      {validation.touched.incomeAccount &&
                      validation.errors.incomeAccount ? (
                        <FormFeedback type="invalid">
                          {" "}
                          {validation.errors.incomeAccount}{" "}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Asset Account</Label>
                      <Input
                        name="assetAccount"
                        label="Asset Account"
                        type="select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.assetAccount || ""}
                        invalid={
                          validation.touched.assetAccount &&
                          validation.errors.assetAccount
                            ? true
                            : false
                        }
                      >
                        <option value="">Select Account</option>
                        {creationAccounts?.assetAccounts?.map((acc) => {
                          return (
                            <option value={acc.id}>{acc.accountName}</option>
                          );
                        })}
                      </Input>
                      {validation.touched.assetAccount &&
                      validation.errors.assetAccount ? (
                        <FormFeedback type="invalid">
                          {" "}
                          {validation.errors.assetAccount}{" "}
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
                        {!!isEdit ? "Update Product" : "Add Product"}{" "}
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

export default Products;
