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
import { LoggedUserContext } from "../../App";

const SalesReturns = () => {
  //meta title
  document.title = "Sales Returns";

  const [user, setUser] = useState();

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  const [purchase, setSale] = useState();
  const [isLoading, setLoading] = useState(false);
  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (purchase && purchase._id) || "",
      name: (purchase && purchase.name) || "",
      //   image: (purchase && purchase.image) || "", will come to it later
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Product Name"),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        const updatedProduct = {
          name: values["name"],
        };

        const purchaseId = values["id"];

        try {
          const { data } = await axiosInstance.put(
            `sales/${purchaseId}`,
            updatedProduct
          );
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchSalesReturns();
          } else {
            toast.error("Sorry something went wrong");
          }
        } catch (err) {
          toast.error("Sorry something went wrong");
        }
      } else {
        const newProduct = {
          name: values["name"],
        };

        try {
          const { data } = await axiosInstance.post("sales", newProduct);
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchSalesReturns();
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
  const [sales, setSalesReturns] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchSalesReturns = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("sales/returns");
      if (data.success) {
        setSalesReturns(data.returns);
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
    fetchSalesReturns();
  }, []);

  let navigate = useNavigate();

  const cancelSalesReturn = async (id) => {
    try {
      const { data } = await axiosInstance.post("sales/cancel_sales_return", {
        salesReturnId: id,
        userId: user.id,
      });
      if (data.success) {
        toast.success("Succefully Cancelled");
        setDeleteModal(false);
        fetchSalesReturns();
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
        header: "Sales No",
        accessorKey: "salesNo",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Date",
        accessorKey: "return_date",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          const formattedDate = moment(cell.row.original.return_date).format(
            "D MMM YY"
          );
          return <>{formattedDate}</>;
        },
      },
      {
        header: "Customer",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Total",
        accessorKey: "total",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          return <>$ {cell.row.original.total}</>;
        },
      },
      {
        header: "Paid",
        accessorKey: "paid",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          if (cell.row.original.paid) return <>$ {cell.row.original.paid}</>;
          else return <>$ 0</>;
        },
      },
      {
        header: "Action",
        cell: (cellProps) => {
          if (cellProps.row.original.status == "Prior") return null;
          return (
            <div className="d-flex gap-3">
              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  setSale(cellProps.row.original);
                  setDeleteModal(true);
                }}
              >
                <Button type="button" color="danger" className="btn-sm px-3">
                  Cancel
                </Button>
              </Link>
              <Link
                to={`/sales-returns/invoice/${cellProps.row.original.id}`}
                className="text-success"
              >
                <Button type="button" color="info" className="btn-sm px-3">
                  view invoice
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
        warningText={"Are you sure to cancel this purchase "}
        onDeleteClick={() => cancelSalesReturn(purchase.id)}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="Sales" breadcrumbItem="Sales Returns" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={sales || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={true}
                      handleUserClick={() => {
                        navigate("new");
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Sales Returns"
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

export default SalesReturns;
