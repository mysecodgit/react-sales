import React, { useEffect, useState, useMemo } from "react";
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

const SystemActions = () => {
  //meta title
  document.title = "System Actions";

  const [systemAction, setSystemAction] = useState();
  const [isLoading, setLoading] = useState(true);
  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (systemAction && systemAction.actionId) || "",
      title: (systemAction && systemAction.title) || "",
      sub_menu_id: (systemAction && systemAction.menuId) || "",
      isActive: (systemAction && systemAction.isActive) || "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Please Enter Title"),
      sub_menu_id: Yup.number().required("Please Select parent"),
      isActive: Yup.number().required("Please Select status"),
    }),
    onSubmit: async (values) => {
      console.log("vlaues ** ", values);
      if (isEdit) {
        const updatedMenu = {
          title: values["title"],
          sub_menu_id: values["sub_menu_id"],
          isActive: values["isActive"],
        };

        const systemActionId = values["id"];

        try {
          const { data } = await axiosInstance.put(
            `systemActions/${systemActionId}`,
            updatedMenu
          );
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchSystemActions();
          } else {
            toast.error("Sorry something went wrong");
          }
        } catch (err) {
          toast.error("Sorry something went wrong");
        }
      } else {
        const newMenu = {
          title: values["title"],
          sub_menu_id: values["sub_menu_id"],
          isActive: values["isActive"],
        };

        try {
          const { data } = await axiosInstance.post("systemActions", newMenu);
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchSystemActions();
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
  const [systemActions, setSystemActions] = useState([]);
  const [systemSubMenues, setSystemSubMenu] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchSystemActions = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("systemActions");
      if (data.success) {
        setSystemActions(data.systemActions);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error ", error);
    }
  };

  const fetchSystemSubMenu = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("systemSubMenues");
      if (data.success) {
        setSystemSubMenu(data.systemSubMenues);
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
    fetchSystemActions();
    fetchSystemSubMenu();
  }, []);

  const onDeleteMenu = async () => {
    try {
      const { data } = await axiosInstance.delete(
        "systemActions/" + systemAction.actionId
      );
      if (data.success) {
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchSystemActions();
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
        header: "ID",
        accessorKey: "actionId",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Title",
        accessorKey: "title",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Menu",
        accessorKey: "menuTitle",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Status",
        accessorKey: "isActive",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Action",
        cell: (cellProps) => {
          if (cellProps.row.original.isDefault) return null;
          return (
            <div className="d-flex gap-3">
              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  setIsEdit(true);
                  const userData = cellProps.row.original;
                  console.log(userData);
                  setSystemAction(userData);
                  setIsNewModelOpen(true);
                }}
              >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
              </Link>
              <Link
                to="#"
                className="text-danger"
                onClick={() => {
                  const userData = cellProps.row.original;
                  console.log(userData);
                  setSystemAction(userData);
                  setDeleteModal(true);
                }}
              >
                <i className="mdi mdi-delete font-size-18" id="deletetooltip" />
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
        warningText={"Are you sure to delete this systemAction "}
        boldText={systemAction?.name}
        onDeleteClick={() => onDeleteMenu()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="System Actions" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={systemActions || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={true}
                      handleUserClick={() => {
                        setIsEdit(false);
                        setSystemAction("");
                        setIsNewModelOpen(!isNewModalOpen);
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Action"
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
              {!!isEdit ? "Edit Menu" : "Add Menu"}
            </ModalHeader>
            <ModalBody>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log(validation.errors);
                  validation.handleSubmit();
                  return false;
                }}
              >
                <Row>
                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Menu</Label>
                      <Input
                        name="sub_menu_id"
                        label="Is Active"
                        type="select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.sub_menu_id || ""}
                        invalid={
                          validation.touched.sub_menu_id &&
                          validation.errors.sub_menu_id
                            ? true
                            : false
                        }
                      >
                        <option value="">Select Parent Menu</option>
                        {systemSubMenues?.map((menu) => {
                          return (
                            <option key={menu.id} value={menu.id}>
                              {menu.title}
                            </option>
                          );
                        })}
                      </Input>
                      {validation.touched.sub_menu_id &&
                      validation.errors.sub_menu_id ? (
                        <FormFeedback type="invalid">
                          {" "}
                          {validation.errors.sub_menu_id}{" "}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>Title</Label>
                      <Input
                        name="title"
                        type="text"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.title || ""}
                        invalid={
                          validation.touched.title && validation.errors.title
                            ? true
                            : false
                        }
                      />
                      {validation.touched.title && validation.errors.title ? (
                        <FormFeedback type="invalid">
                          {validation.errors.title}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>Is Active</Label>
                      <Input
                        name="isActive"
                        label="Is Active"
                        type="select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.isActive || ""}
                        invalid={
                          validation.touched.isActive &&
                          validation.errors.isActive
                            ? true
                            : false
                        }
                      >
                        <option value="">Select Status</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </Input>
                      {validation.touched.isActive &&
                      validation.errors.isActive ? (
                        <FormFeedback type="invalid">
                          {" "}
                          {validation.errors.isActive}{" "}
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
                        {!!isEdit ? "Update Menu" : "Add Menu"}{" "}
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

export default SystemActions;
