import React, { useEffect, useState, useMemo } from "react";
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

const Expenses = () => {
  //meta title
  document.title = "Expense Returns";

  const [check, setCheck] = useState();
  const [isLoading, setLoading] = useState(false);

  const [isNewModalOpen, setIsNewModelOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [checks, setChecks] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchChecks = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("checks");
      if (data.success) {
        setChecks(data.checks);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };

  useEffect(() => {
    fetchChecks();
  }, []);

  let navigate = useNavigate();

  const cancelCheck = async (id) => {
    try {
      const { data } = await axiosInstance.post("checks/cancel_check", {
        checkId: id,
      });
      if (data.success) {
        toast.success("Succefully Cancelled");
        setDeleteModal(false);
        fetchChecks();
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
          const formattedDate = moment(cell.row.original.date).format(
            "D MMM YYYY"
          );
          return <>{formattedDate}</>;
        },
      },
      {
        header: "Bank account",
        accessorKey: "accountName",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Paid To",
        accessorKey: "",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          return (
            <>
              {cell.row.original.vendorName || cell.row.original.customerName}
            </>
          );
        },
      },
      {
        header: "Amount",
        accessorKey: "amount",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          return <>$ {cell.row.original.amount}</>;
        },
      },

      {
        header: "Action",
        cell: (cellProps) => {
          return (
            <div className="d-flex gap-3">
              <Link
                to={`${cellProps.row.original.id}/edit`}
                className="text-success"
              >
                <Button type="button" color="success" className="btn-sm px-3">
                  Edit
                </Button>
              </Link>

              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  setCheck(cellProps.row.original);
                  setDeleteModal(true);
                }}
              >
                <Button type="button" color="danger" className="btn-sm px-3">
                  Cancel
                </Button>
              </Link>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        warningText={"Are you sure to cancel this check "}
        onDeleteClick={() => cancelCheck(check.id)}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="Expenses" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={checks || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={true}
                      isAddButton={true}
                      handleUserClick={() => {
                        navigate("new");
                      }}
                      buttonClass="btn btn-success btn-rounded waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Expense"
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

export default Expenses;
