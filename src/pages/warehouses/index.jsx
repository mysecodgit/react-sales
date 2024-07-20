import React, { useEffect, useState, useMemo, useContext } from "react";
import { Link } from "react-router-dom";
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
import { type } from "@testing-library/user-event/dist/cjs/utility/type.js";
import { UrlActionContext } from "../../App";

const WareHouses = () => {
  //meta title
  document.title = "Branches";

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

  const [warehouse, setWareHouse] = useState();
  const [isLoading, setLoading] = useState(true);
  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (warehouse && warehouse.id) || "",
      name: (warehouse && warehouse.branch_name) || "",
      location: (warehouse && warehouse.branch_location) || "",
      type: (warehouse && warehouse.type) || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Your Name"),
      type: Yup.string().required("Please Select type"),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        const updatedUser = {
          name: values["name"],
          location: values["location"],
          type: values["type"],
        };

        const warehouseId = values["id"];

        try {
          const { data } = await axiosInstance.put(`branches/update_branch`, {
            branchId: warehouseId,
            ...updatedUser,
          });
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchWareHouses();
          } else {
            toast.error("Sorry something went wrong");
          }
        } catch (err) {
          toast.error("Sorry something went wrong");
        }
      } else {
        const newVendor = {
          name: values["name"],
          location: values["location"],
          type: values["type"],
        };

        try {
          const { data } = await axiosInstance.post("branches", newVendor);
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchWareHouses();
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
  const [warehouses, setWareHouses] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchWareHouses = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("branches");
      if (data.success) {
        setWareHouses(data.branches);
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
    fetchWareHouses();
  }, []);

  const onDeleteWareHouse = async () => {
    try {
      const { data } = await axiosInstance.post("branches/delete_branch", {
        branchId: warehouse.id,
      });
      if (data.success) {
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchWareHouses();
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
        accessorKey: "branch_name",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Location",
        accessorKey: "branch_location",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Type",
        accessorKey: "type",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => {
          if (cellProps.row.original.type == "hq") return <>main branch</>;
          return <>{cellProps.row.original.type}</>;
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
                    setWareHouse(userData);
                    setIsNewModelOpen(true);
                  }}
                >
                  <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
                </Link>
              )}
              {cellProps.row.original.type != "hq" &&
                urlActions.includes("delete") && (
                  <Link
                    to="#"
                    className="text-danger"
                    onClick={() => {
                      const userData = cellProps.row.original;
                      setWareHouse(userData);
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
        warningText={"Are you sure to delete this branch "}
        boldText={warehouse?.name}
        onDeleteClick={() => onDeleteWareHouse()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="Branches" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={warehouses || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={urlActions.includes("create")}
                      handleUserClick={() => {
                        setIsEdit(false);
                        setWareHouse("");
                        setIsNewModelOpen(!isNewModalOpen);
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Branch"
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
            isOpen={isNewModalOpen}
            toggle={() => setIsNewModelOpen(!isNewModalOpen)}
          >
            <ModalHeader
              toggle={() => setIsNewModelOpen(!isNewModalOpen)}
              tag="h4"
            >
              {!!isEdit ? "Edit WareHouse" : "Add WareHouse"}
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
                    <div className="mb-3">
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
                    </div>
                    <div className="mb-3">
                      <Label>Type</Label>
                      <Input
                        name="type"
                        label="Type"
                        type="select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.type || ""}
                        invalid={
                          validation.touched.type && validation.errors.type
                            ? true
                            : false
                        }
                      >
                        <option value="office">office</option>
                        <option value="storage">storage</option>
                      </Input>
                      {validation.touched.type && validation.errors.type ? (
                        <FormFeedback type="invalid">
                          {" "}
                          {validation.errors.type}{" "}
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
                        {!!isEdit ? "Update WareHouse" : "Add WareHouse"}{" "}
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

export default WareHouses;
