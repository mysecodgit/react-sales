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
import { UrlActionContext } from "../../App";
import { LoggedUserContext } from "../../App";
const Sales = () => {
  //meta title
  document.title = "Sales";
  let navigate = useNavigate();

  const [user, setUser] = useState();

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  const urlActions = useContext(UrlActionContext);

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
            fetchSales();
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
            fetchSales();
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
  const [sales, setSales] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("sales");
      if (data.success) {
        setSales(data.sales);
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
    fetchSales();
  }, []);

  const cancelSale = async (id) => {
    try {
      const { data } = await axiosInstance.post("sales/cancel_sale", {
        saleId: id,
        userId: user.id,
      });
      if (data.success) {
        toast.success("Succefully Cancelled");
        setDeleteModal(false);
        fetchSales();
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
        accessorKey: "sales_date",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          const formattedDate = moment(cell.row.original.sales_date).format(
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
        header: "Sub total",
        accessorKey: "subtotal",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          return <>$ {cell.row.original.subtotal}</>;
        },
      },
      {
        header: "Discount",
        accessorKey: "discount",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          return <>$ {cell.row.original.discount}</>;
        },
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
      // {
      //   header: "Status",
      //   accessorKey: "status",
      //   enableColumnFilter: false,
      //   enableSorting: true,
      //   cell: (cell) => {
      //     if (cell.row.original.status == "Prior")
      //       return (
      //         <Badge color="danger" className="me-1">
      //           Cancelled
      //         </Badge>
      //       );
      //     else
      //       return (
      //         <Badge color="warning" className="pending">
      //           Pending
      //         </Badge>
      //       );
      //   },
      // },
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
                to={`/sales/invoice/${cellProps.row.original.id}`}
                className="text-success"
              >
                <Button type="button" color="info" className="btn-sm px-3">
                  View
                </Button>
              </Link>
            </div>
          );
        },
      },
    ],
    []
  );

  // if (urlActions) {
  //   if (!urlActions.includes("view")) {
  //     return (
  //       <>
  //         <div className="page-content">
  //           <Container fluid>
  //             <div className="alert alert-danger">
  //               Not authorized to view this page
  //             </div>
  //           </Container>
  //         </div>
  //       </>
  //     );
  //   }
  // }

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        warningText={"Are you sure to cancel this purchase "}
        onDeleteClick={() => cancelSale(purchase.id)}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="Sales" />
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
                      buttonName="New Sales"
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

export default Sales;
