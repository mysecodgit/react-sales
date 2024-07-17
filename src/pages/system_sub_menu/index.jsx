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

const SystemSubMenu = () => {
  //meta title
  document.title = "System Sub Menues";

  const [systemMenu, setSystemMenu] = useState();
  const [isLoading, setLoading] = useState(true);
  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (systemMenu && systemMenu.id) || "",
      title: (systemMenu && systemMenu.title) || "",
      url: (systemMenu && systemMenu.url) || "",
      menu_id: (systemMenu && systemMenu.menu_id) || "",
      isActive: (systemMenu && systemMenu.isActive) || "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Please Enter Title"),
      url: Yup.string().required("Please Enter the url"),
      menu_id: Yup.number().required("Please Select parent"),
      isActive: Yup.number().required("Please Select status"),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        const updatedMenu = {
          title: values["title"],
          url: values["url"],
          menu_id: values["menu_id"],
          isActive: values["isActive"],
        };

        const systemMenuId = values["id"];

        try {
          const { data } = await axiosInstance.put(
            `systemSubMenues/${systemMenuId}`,
            updatedMenu
          );
          if (data.success) {
            toast.success("Successfully updated.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchSystemSubMenu();
          } else {
            toast.error("Sorry something went wrong");
          }
        } catch (err) {
          toast.error("Sorry something went wrong");
        }
      } else {
        const newMenu = {
          title: values["title"],
          url: values["url"],
          menu_id: values["menu_id"],
          isActive: values["isActive"],
        };

        try {
          const { data } = await axiosInstance.post("systemSubMenues", newMenu);
          if (data.success) {
            toast.success("Successfully created.");
            validation.resetForm();
            setIsNewModelOpen(false);
            fetchSystemSubMenu();
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
  const [systemMenues, setSystemMenues] = useState([]);
  const [systemSubMenues, setSystemSubMenu] = useState([]);
  const [systemMenuTypes, setSystemMenuTypes] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchSystemMenues = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("systemMenues");
      if (data.success) {
        setSystemMenues(data.systemMenues);
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
    fetchSystemMenues();
    fetchSystemSubMenu();
  }, []);

  const onDeleteMenu = async () => {
    try {
      const { data } = await axiosInstance.delete(
        "systemSubMenues/" + systemMenu.id
      );
      if (data.success) {
        toast.success("Succefully Deleted");
        setDeleteModal(false);
        fetchSystemSubMenu();
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
        accessorKey: "id",
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
        header: "Url",
        accessorKey: "url",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Parent Menu",
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
                  setSystemMenu(userData);
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
                  setSystemMenu(userData);
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
        warningText={"Are you sure to delete this systemMenu "}
        boldText={systemMenu?.name}
        onDeleteClick={() => onDeleteMenu()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="People" breadcrumbItem="SystemSubMenu" />
          {isLoading ? (
            <Spinners setLoading={setLoading} />
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TableContainer
                      columns={columns}
                      data={systemSubMenues || []}
                      isGlobalFilter={true}
                      isPagination={false}
                      SearchPlaceholder="Search..."
                      isCustomPageSize={false}
                      isAddButton={true}
                      handleUserClick={() => {
                        setIsEdit(false);
                        setSystemMenu("");
                        setIsNewModelOpen(!isNewModalOpen);
                      }}
                      buttonClass="btn btn-success btn-rounded-md waves-effect waves-light addContact-modal mb-2"
                      buttonName="New Sub Menu"
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
                  validation.handleSubmit();
                  return false;
                }}
              >
                <Row>
                  <Col xs={12}>
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
                      <Label>Url</Label>
                      <Input
                        name="url"
                        type="text"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.url || ""}
                        invalid={
                          validation.touched.url && validation.errors.url
                            ? true
                            : false
                        }
                      />
                      {validation.touched.url && validation.errors.url ? (
                        <FormFeedback type="invalid">
                          {validation.errors.url}
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label>Parent Menu</Label>
                      <Input
                        name="menu_id"
                        label="Is Active"
                        type="select"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.menu_id || ""}
                        invalid={
                          validation.touched.menu_id &&
                          validation.errors.menu_id
                            ? true
                            : false
                        }
                      >
                        <option value="">Select Parent Menu</option>
                        {systemMenues?.map((menu) => {
                          return (
                            <option key={menu.id} value={menu.id}>
                              {menu.title}
                            </option>
                          );
                        })}
                      </Input>
                      {validation.touched.menu_id &&
                      validation.errors.menu_id ? (
                        <FormFeedback type="invalid">
                          {" "}
                          {validation.errors.menu_id}{" "}
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

export default SystemSubMenu;
