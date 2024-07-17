import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Card, CardBody, Col, Container, Row, Table } from "reactstrap";
import { isEmpty, map } from "lodash";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

//Import Image
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";
import "./invoice.css";
import axiosInstance from "../../services/axiosService";

const SalesReturnInvoice = () => {
  //meta title
  document.title = "Invoice Detail";

  //Print the Invoice
  const printInvoice = () => {
    window.print();
  };

  const { id } = useParams();

  const [invoiceDetail, setInvoiceDetail] = useState(null);

  const fetchSalesReturnInvoice = async (returnId) => {
    try {
      const { data } = await axiosInstance.post(
        `sales/get_sales_return_by_id`,
        {
          returnId,
        }
      );

      if (data.success) {
        if (data.saleReturn) {
          setInvoiceDetail({
            saleReturn: data.saleReturn,
            details: data.details,
            paid: data.paid,
          });
        }
      }
    } catch (ex) {}
  };

  useEffect(() => {
    if (id) {
      fetchSalesReturnInvoice(id);
    }
  }, [id]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="Invoices" breadcrumbItem="Invoice Detail" />
          {invoiceDetail && (
            <Row>
              <Col lg={12}>
                <Card className="" style={{ boxShadow: "none" }}>
                  <CardBody className="">
                    <div className="invoice-title">
                      <h4 className="float-end font-size-16">
                        Return Invoice # {invoiceDetail.saleReturn.id}
                      </h4>
                      <div className="auth-logo mb-4">
                        <img
                          src={logoDark}
                          alt="logo"
                          className="auth-logo-dark"
                          height="20"
                        />
                        <img
                          src={logoLight}
                          alt="logo"
                          className="auth-logo-light"
                          height="20"
                        />
                      </div>
                    </div>
                    <hr />
                    <Row>
                      <Col sm={6}>
                        <address>
                          <strong>Refunded To:</strong>
                          <br />
                          <div className="py-1"></div>
                          <React.Fragment>
                            <span>{invoiceDetail.saleReturn.name}</span>
                            <br />
                          </React.Fragment>
                          <div className="py-1"></div>
                          <React.Fragment>
                            <span>{invoiceDetail.saleReturn.phone}</span>
                            <br />
                          </React.Fragment>
                        </address>
                      </Col>
                    </Row>
                    <div className="py-2 mt-3">
                      <h3 className="font-size-15 fw-bold">
                        Sales Return summary
                      </h3>
                    </div>
                    <div className="ttable-responsive">
                      <Table className="table-nowrap">
                        <thead>
                          <tr>
                            <th style={{ width: "70px" }}>No.</th>
                            <th>Item</th>
                            <th>QTY</th>
                            <th>PRICE</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceDetail.details.map((item, key) => (
                            <tr key={key}>
                              <td>{key + 1}</td>
                              <td>{item.product_name}</td>
                              <td>{item.qty}</td>
                              <td>${item.price}</td>
                              <td className="text-end">
                                $
                                {(
                                  parseInt(item.qty) * parseFloat(item.price)
                                ).toFixed(2)}
                              </td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={4} className="border-0 text-end">
                              <strong>Total</strong>
                            </td>
                            <td className="border-0 text-end">
                              <h5 className="m-0">
                                ${invoiceDetail.saleReturn.total}
                              </h5>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="border-0 text-end">
                              <strong>Paid</strong>
                            </td>
                            <td className="border-0 text-end">
                              <h5 className="m-0">
                                ${invoiceDetail.paid || 0}
                              </h5>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                    <div className="d-print-none">
                      <div className="float-end">
                        <Link
                          to="#"
                          onClick={printInvoice}
                          className="btn btn-success  me-2"
                        >
                          <i className="fa fa-print" />
                        </Link>
                        <Link to="#" className="btn btn-primary w-md ">
                          Send
                        </Link>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default SalesReturnInvoice;
