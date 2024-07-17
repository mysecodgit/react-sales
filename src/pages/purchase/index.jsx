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
const Purchases = () => {
  //meta title
  document.title = "Purchases";
  let navigate = useNavigate();

  const [user, setUser] = useState();

  const loggedUser = useContext(LoggedUserContext);

  useEffect(() => {
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, [loggedUser]);

  const urlActions = useContext(UrlActionContext);

  const [purchase, setPurchase] = useState();
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
            `purchases/${purchaseId}`,
            updatedProduct
          );
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchPurchases();
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
          const { data } = await axiosInstance.post("purchases", newProduct);
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchPurchases();
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
  const [purchases, setPurchases] = useState([
    
  ]);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("purchases");
      if (data.success) {
        setPurchases(data.purchases);
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
    fetchPurchases();
  }, []);

  const onDeleteProduct = async () => {
    try {
      const { data } = await axiosInstance.delete("purchases/" + purchase._id);
      if (data.success) {
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchPurchases();
      } else {
        toast.error("Something went wrong");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const cancelPurchase = async (id) => {
    try {
      const { data } = await axiosInstance.post("purchases/cancel_purchase", {
        purchaseId: id,
        userId: user.id,
      });
      if (data.success) {
        toast.success("Succefully Cancelled");
        setDeleteModal(false);
        fetchPurchases();
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
        header: "Purchas No",
        accessorKey: "purchaseNo",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Date",
        accessorKey: "purchase_date",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cell) => {
          const formattedDate = moment(cell.row.original.purchase_date).format(
            "D MMM YY"
          );
          return <>{formattedDate}</>;
        },
      },
      {
        header: "Vendor",
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
          // if (cellProps.row.original.status == "Prior") return null;
          if (urlActions && !urlActions.includes("cancel")) return null;
          return (
            <div className="d-flex gap-3">
              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  setPurchase(cellProps.row.original);
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

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        warningText={"Are you sure to cancel this purchase "}
        onDeleteClick={() => cancelPurchase(purchase.id)}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="Purchases" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={purchases || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={
                        urlActions?.includes("create") ? true : false
                      }
                      handleUserClick={() => {
                        navigate("new");
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Purchase"
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

export default Purchases;
