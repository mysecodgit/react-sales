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
import { LoggedUserContext } from "../../App";

const GeneralJournal = () => {
  //meta title
  document.title = "Transfer money";

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
  const [moneyTransfers, setGeneralJournals] = useState([]);
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

  const [journalId, setJournalId] = useState(null);

  const fetchGeneralJournals = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post("general_journals/get_all", {});
      if (data.success) {
        setGeneralJournals(data.journals);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };

  const fetchGeneralJournalsById = async (journalId) => {
    try {
      const { data } = await axiosInstance.post(
        "products/get_transfers_by_id",
        {
          journalId,
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
    if (selectedType) {
    }
  }, [selectedType]);

  useEffect(() => {
    fetchGeneralJournals();

    fetchProducts();
    fetchBranches();
  }, []);

  let navigate = useNavigate();

  const onDeleteJournal = async () => {
    try {
      const { data } = await axiosInstance.post("general_journals/delete", {
        journalId,
        userId: user.id,
      });
      if (data.success) {
        fetchGeneralJournals();
        toast.success("Succefully Deleted");
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
                  <th className="w-25">Account</th>
                  <th className="w-25 text-end">Debit</th>
                  <th className="w-25 text-end pe-3">Credit</th>
                </tr>
              </thead>
              <tbody>
                {row.details.map((journal) => {
                  return (
                    <tr>
                      <td style={{ paddingTop: 4, paddingBottom: 6 }}>
                        {journal.accountName}
                      </td>
                      <td className="text-end">{journal.debit}</td>
                      <td className="text-end pe-3">{journal.credit}</td>
                    </tr>
                  );
                })}

                <tr>
                  <td
                    style={{ borderTop: "1px solid #d9d9d9", paddingTop: 11 }}
                  >
                    Total
                  </td>
                  <td
                    className="text-end"
                    style={{ borderTop: "1px solid #d9d9d9", paddingTop: 11 }}
                  >
                    {row.details
                      .reduce((a, c) => a + parseFloat(c.debit || 0), 0)
                      .toFixed(2)}
                  </td>
                  <td
                    className="text-end pe-3"
                    style={{ borderTop: "1px solid #d9d9d9", paddingTop: 11 }}
                  >
                    {row.details
                      .reduce((a, c) => a + parseFloat(c.credit || 0), 0)
                      .toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          );
        },
      },
      {
        header: "Action",
        cell: (cellProps) => {
          return (
            <div className="d-flex gap-3">
              <Link
                to={"edit/" + cellProps.row.original.id}
                className="text-success"
              >
                <Button type="button" color="success" className="btn-sm">
                  Edit
                </Button>
              </Link>
              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  setJournalId(cellProps.row.original.id);
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
        onDeleteClick={() => onDeleteJournal()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="GeneralJournal" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card className="mb-3">
                  <CardBody className="py-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <Button
                        color="success ms-auto"
                        size="md"
                        onClick={() => navigate("new")}
                      >
                        New General Journal
                      </Button>
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
        </Container>
      </div>
      <ToastContainer />
    </React.Fragment>
  );
};

export default GeneralJournal;
