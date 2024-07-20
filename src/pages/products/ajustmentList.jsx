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
import { UrlActionContext } from "../../App";

const Adjustment = () => {
  //meta title
  document.title = "Adjustment";

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

  const [isLoading, setLoading] = useState(false);

  const [transfer, setTransfer] = useState(null);

  const [qty, setQty] = useState(null);
  const [transferDate, setTransferDate] = useState(new Date());
  const [isNewModalOpen, setIsNewModelOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [moneyTransfers, setAdjustments] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const [branches, setBranches] = useState();
  const [products, setProducts] = useState();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFromBranch, setSelectedFromBranch] = useState(null);
  const [selectedToBranch, setSelectedToBranch] = useState(null);
  const [selectedType, setSelectedType] = useState({
    label: "quantity",
    value: "quantity",
  });

  const [rows, setRows] = useState([
    {
      selectedProduct: null,
      selectedFromBranch: null,
      selectedToBranch: null,
      productId: "",
      fromBranchId: "",
      toBranchId: "",
      qty: "",
    },
  ]);

  const addRow = () => {
    setRows([
      ...rows,
      { productId: "", fromBranchId: "", toBranchId: "", qty: "" },
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
    };
    setRows(updatedRows);
  };

  const handleSelectedFromBranch = (index, branch) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      selectedFromBranch: branch,
      fromBranchId: branch.value,
    };

    if (
      updatedRows[index].selectedFromBranch.value ==
      updatedRows[index].selectedToBranch?.value
    ) {
      toast.error("branch waa inee kala duwanaadan");
      updatedRows[index] = {
        ...updatedRows[index],
        selectedFromBranch: null,
        fromBranchId: "",
      };
    }
    setRows(updatedRows);
  };

  const handleSelectedToBranch = (index, branch) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      selectedToBranch: branch,
      toBranchId: branch.value,
    };

    if (
      updatedRows[index].selectedFromBranch?.value ==
      updatedRows[index].selectedToBranch.value
    ) {
      toast.error("branch waa inee kala duwanaadan");
      updatedRows[index] = {
        ...updatedRows[index],
        selectedToBranch: null,
        toBranchId: "",
      };
    }
    setRows(updatedRows);
  };

  const handleQtyChange = (index, newQuantity) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      qty: newQuantity,
    };
    setRows(updatedRows);
  };

  const [transferId, setTransferId] = useState(null);

  const fetchAdjustments = async (type) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post("adjustments/get_all_by_type", {
        type: type,
      });
      if (data.success) {
        setAdjustments(data.adjustments);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };

  const fetchAdjustmentsById = async (transferId) => {
    try {
      const { data } = await axiosInstance.post(
        "products/get_transfers_by_id",
        {
          transferId,
        }
      );

      if (data.success) {
        setRows(
          data.transfers.map((transfer) => ({
            selectedProduct: {
              label: transfer.productName,
              value: transfer.productId,
            },
            productId: transfer.productId,
            fromBranchId: transfer.fromBranchId,
            toBranchId: transfer.toBranchId,
            selectedFromBranch: {
              label: transfer.fromBranch,
              value: transfer.fromBranchId,
            },
            selectedToBranch: {
              label: transfer.toBranch,
              value: transfer.toBranchId,
            },
            qty: transfer.qty,
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

  useEffect(() => {
    if (transferId) {
      fetchAdjustmentsById(transferId);
    }
  }, [transferId]);

  useEffect(() => {
    if (selectedType) {
      fetchAdjustments(selectedType.value);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchProducts();
    fetchBranches();
  }, []);

  let navigate = useNavigate();

  const onCancelTransfer = async () => {
    try {
      const { data } = await axiosInstance.post(
        "products/delete_transfer_products",
        {
          transferId,
        }
      );
      if (data.success) {
        toast.success("Succefully Cancelled");
        setDeleteModal(false);
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
        header: "Details",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          const row = cell.row.original;
          return (
            <table className="w-100">
              <thead className="bg-info text-white ">
                <tr>
                  <th className="w-25">Product</th>
                  <th className="w-25">
                    {row.type == "quantity" ? "Old Qty" : "Old Value"}
                  </th>
                  <th className="w-25">
                    {row.type == "quantity" ? "New Qty" : "New Value"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {row.details.map((adj) => {
                  return (
                    <tr>
                      <td>{adj.name}</td>
                      <td>{adj.old_qty || "$" + adj.old_value}</td>
                      <td>{adj.new_qty || "$" + adj.new_value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        },
      },
      //   {
      //     header: "Qty",
      //     accessorKey: "qty",
      //     enableColumnFilter: false,
      //     enableSorting: true,
      //   },
      //   {
      //     header: "From",
      //     accessorKey: "fromBranch",
      //     enableColumnFilter: false,
      //     enableSorting: true,
      //   },
      //   {
      //     header: "To",
      //     accessorKey: "toBranch",
      //     enableColumnFilter: false,
      //     enableSorting: true,
      //   },
      //   {
      //     header: "User",
      //     accessorKey: "username",
      //     enableColumnFilter: false,
      //     enableSorting: true,
      //   },
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
                  setTransferId(cellProps.row.original.id);
                  setTransferDate(cellProps.row.original.date);

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
                  setTransferId(cellProps.row.original.id);
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
          <Breadcrumbs title="People" breadcrumbItem="Adjustment" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card className="mb-3">
                  <CardBody className="py-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="" style={{ width: 180 }}>
                        <Label>Type</Label>
                        <Select
                          name=""
                          value={selectedType}
                          onChange={(selected) => {
                            setSelectedType(selected);
                          }}
                          options={[
                            { label: "quantity", value: "quantity" },
                            { label: "value", value: "value" },
                          ]}
                          styles={selectStyles}
                          className="select2-selection"
                        />
                      </div>
                      {urlActions.includes("create") && (
                        <Button
                          color="success"
                          size="md"
                          onClick={() => navigate("make-adjustment")}
                        >
                          New Adjustment
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={moneyTransfers || []}
                      isGlobalFilter={false}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={false}
                      handleUserClick={() => {
                        setIsEdit(false);
                        setIsNewModelOpen(true);
                      }}
                      buttonClass="btn btn-success btn-rounded waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Contact"
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
            size="lg"
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

                  for (const row of rows) {
                    const {
                      selectedProduct,
                      selectedFromBranch,
                      selectedToBranch,
                      qty,
                    } = row;

                    if (!selectedProduct) return toast.error("Dooro product");
                    if (!selectedFromBranch)
                      return toast.error("Dooro branch laga qaadayo");
                    if (!selectedToBranch)
                      return toast.error("Dooro branch la geenayo");
                    if (!qty) return toast.error("Geli tirada la qaadayo");
                  }

                  if (!transferDate) return toast.error("Galid Taariikhda");

                  const user = JSON.parse(localStorage.getItem("current_user"));

                  const transferData = {
                    transferId,
                    date: transferDate,
                    userId: user.id,
                    rows,
                  };

                  if (isEdit) {
                    try {
                      const { data } = await axiosInstance.post(
                        "products/update_transfer_products",
                        transferData
                      );
                      if (data.success) {
                        toast.success(data.message);
                        setIsNewModelOpen(false);
                      } else {
                        toast.error("something went wrong");
                      }
                    } catch (err) {
                      toast.error("something went wrong");
                    }
                  } else {
                    try {
                      const { data } = await axiosInstance.post(
                        "products/transfer_products",
                        transferData
                      );
                      if (data.success) {
                        toast.success(data.message);
                        setIsNewModelOpen(false);
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
                      <Label>Date</Label>
                      <InputGroup>
                        <Flatpickr
                          className="form-control d-block"
                          placeholder="dd M,yyyy"
                          value={transferDate}
                          onChange={(e) => {
                            const utcDate = moment(e[0])
                              .utc()
                              .format("YYYY-MM-DD HH:mm:ss");
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

                {rows.map((row, index) => {
                  return (
                    <Row key={index}>
                      <Col lg="3">
                        <div className="mb-3">
                          <Label>Products</Label>
                          <Select
                            name=""
                            value={row.selectedProduct}
                            onChange={(selected) =>
                              handleSelectedProduct(index, selected)
                            }
                            options={products}
                            styles={selectStyles}
                            className="select2-selection"
                          />
                        </div>
                      </Col>
                      <Col lg="3">
                        <div className="mb-3">
                          <Label>From Branch</Label>
                          <Select
                            name=""
                            value={row.selectedFromBranch}
                            onChange={(selected) =>
                              handleSelectedFromBranch(index, selected)
                            }
                            options={branches}
                            styles={selectStyles}
                            className="select2-selection"
                          />
                        </div>
                      </Col>
                      <Col lg="3">
                        <div className="mb-3">
                          <Label>To Branch</Label>
                          <Select
                            name=""
                            value={row.selectedToBranch}
                            onChange={(selected) =>
                              handleSelectedToBranch(index, selected)
                            }
                            options={branches}
                            styles={selectStyles}
                            className="select2-selection"
                          />
                        </div>
                      </Col>
                      <Col lg="2">
                        <div className="mb-3">
                          <Label>Qty</Label>
                          <Input
                            name="qty"
                            type="number"
                            min={0}
                            value={row.qty}
                            onChange={(e) =>
                              handleQtyChange(index, e.target.value)
                            }
                          />
                        </div>
                      </Col>
                      {index == 0 ? (
                        <Col lg="1">
                          <div className="mb-3">
                            <Label>Add</Label>
                            <Button
                              type="button"
                              color="success"
                              className="save-user"
                              onClick={addRow}
                            >
                              +
                            </Button>
                          </div>
                        </Col>
                      ) : (
                        <Col lg="1">
                          <div className="mb-3">
                            <Label>minus</Label>
                            <Button
                              type="button"
                              color="danger"
                              className="save-user"
                              onClick={() => deleteRow(index)}
                            >
                              -
                            </Button>
                          </div>
                        </Col>
                      )}
                    </Row>
                  );
                })}

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

export default Adjustment;
