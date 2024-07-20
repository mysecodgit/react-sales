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
import { LoggedUserContext, UrlActionContext } from "../../App";

const InventoryTransfer = () => {
  //meta title
  document.title = "Transfer Inventory";

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

  const [qty, setQty] = useState(null);
  const [transferDate, setTransferDate] = useState(new Date());
  const [isNewModalOpen, setIsNewModelOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [moneyTransfers, setInventoryTransfers] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const [branches, setBranches] = useState();
  const [products, setProducts] = useState();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFromBranch, setSelectedFromBranch] = useState(null);
  const [selectedToBranch, setSelectedToBranch] = useState(null);

  const [rows, setRows] = useState([
    {
      selectedProduct: null,
      productId: "",
      qty: "",
    },
  ]);

  const addRow = () => {
    setRows([...rows, { selectedProduct: null, productId: "", qty: "" }]);
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

  const fetchInventoryTransfers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post("products/get_transfers", {});
      if (data.success) {
        setInventoryTransfers(data.transfers);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };

  const fetchInventoryTransfersById = async (transferId) => {
    try {
      const { data } = await axiosInstance.post(
        "products/get_transfers_by_id",
        {
          transferId,
        }
      );

      if (data.success) {
        setTransferDate(data.transfer.date);
        setSelectedFromBranch({
          label: data.transfer.fromBranch,
          value: data.transfer.fromBranchId,
        });
        setSelectedToBranch({
          label: data.transfer.toBranch,
          value: data.transfer.toBranchId,
        });

        setRows(
          data.transferDetails.map((transfer) => ({
            selectedProduct: {
              label: transfer.productName,
              value: transfer.productId,
            },
            productId: transfer.productId,
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

  // useEffect(() => {
  //   console.log("T ID : ", transferId);
  //   if (transferId) {
  //     fetchInventoryTransfersById(transferId);
  //   }
  // }, [transferId]);

  useEffect(() => {
    fetchInventoryTransfers();
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
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchInventoryTransfers();
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
          const localDate = new Date(date).toLocaleString("en-US", {
            timeZone: "Africa/Nairobi",
          });

          const formattedDate = moment(localDate).format("DD MMM YYYY");
          return <>{formattedDate}</>;
        },
      },
      {
        header: "From",
        accessorKey: "fromBranch",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "To",
        accessorKey: "toBranch",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Info",
        minSize: 300,
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          const row = cell.row.original;
          return (
            <table className="w-100">
              <thead className="bg-info text-white ">
                <tr>
                  <th className="" style={{ width: 100 }}>
                    Product
                  </th>
                  <th className="" style={{ width: 100 }}>
                    Qty
                  </th>
                </tr>
              </thead>
              <tbody>
                {row.details.map((transfer) => {
                  return (
                    <tr>
                      <td>{transfer.name}</td>
                      <td>{transfer.qty}</td>
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
      //     header: "User",
      //     accessorKey: "username",
      //     enableColumnFilter: false,
      //     enableSorting: true,
      //   },
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
                    fetchInventoryTransfersById(cellProps.row.original.id);
                    setTransferDate(cellProps.row.original.date);
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
    setTransferDate(new Date());
    setSelectedFromBranch(null);
    setSelectedToBranch(null);
    setRows([
      {
        selectedProduct: null,
        productId: "",
        qty: "",
      },
    ]);
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
          <Breadcrumbs title="People" breadcrumbItem="InventoryTransfer" />
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
                        setIsNewModelOpen(true);
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Inventory Transfer"
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

                  if (!selectedFromBranch)
                    return toast.error("Dooro branch laga qaadayo");
                  if (!selectedToBranch)
                    return toast.error("Dooro branch la geenayo");

                  for (const row of rows) {
                    const { selectedProduct, qty } = row;

                    if (!selectedProduct) return toast.error("Dooro product");

                    if (!qty) return toast.error("Geli tirada la qaadayo");
                  }

                  if (!transferDate) return toast.error("Galid Taariikhda");

                  const transferData = {
                    transferId,
                    date: transferDate,
                    userId: user.id,
                    fromBranchId: selectedFromBranch.value,
                    toBranchId: selectedToBranch.value,
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
                        fetchInventoryTransfers();
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
                        "products/transfer_products",
                        transferData
                      );
                      if (data.success) {
                        toast.success(data.message);
                        setIsNewModelOpen(false);
                        fetchInventoryTransfers();
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
                  <Col lg="3">
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
                  <Col lg="3">
                    <div className="mb-3">
                      <Label>From Branch</Label>
                      <Select
                        name=""
                        value={selectedFromBranch}
                        onChange={setSelectedFromBranch}
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
                        value={selectedToBranch}
                        onChange={setSelectedToBranch}
                        options={branches}
                        styles={selectStyles}
                        className="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>

                {rows.map((row, index) => {
                  return (
                    <Row key={index}>
                      <Col lg="4">
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

                      <Col lg="4">
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

export default InventoryTransfer;
