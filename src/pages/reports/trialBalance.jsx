import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Card, CardBody, Col, Container, Row, Table } from "reactstrap";
import { isEmpty, map } from "lodash";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

//Import Image
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";
import "../invoice.css";
import axiosInstance from "../../services/axiosService";
import { UrlActionContext } from "../../App";

const TrialBalance = () => {
  //meta title
  document.title = "Trial Balance - Report";

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

  //Print the Invoice
  const printInvoice = () => {
    window.print();
  };

  const [balances, setBalances] = useState([]);

  const fetchTrialBalance = async () => {
    try {
      const { data } = await axiosInstance.post(`report/get_trial_balance`);

      if (data.success) {
        setBalances(data.report);
      }
    } catch (ex) {}
  };

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  console.table(
    balances.map((b) => ({
      ...b,
      debit: b.typeStatus == "debit" ? b.balance : "",
      credit: b.typeStatus == "credit" ? b.balance : "",
    }))
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="Reports" breadcrumbItem="Trail Balance" />
          {!isEmpty(balances) && (
            <Row>
              <Col lg={12}>
                <Card className="" style={{ boxShadow: "none" }}>
                  <CardBody className="">
                    <div className="invoice-title">
                      <h4 className="float-end font-size-16">Trial Balance</h4>
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

                    {/* <div className="py-2 mt-3">
                      <h3 className="font-size-15 fw-bold">
                        Sales Return summary
                      </h3>
                    </div> */}
                    <div className="table-responsive">
                      <Table className="table-nowrap">
                        <thead>
                          <tr>
                            <th
                              className="bg-primary text-white py-2"
                              style={{ width: "70px" }}
                            >
                              No.
                            </th>
                            <th className="bg-primary text-white  py-2">
                              Account
                            </th>
                            <th className="text-end bg-primary text-white  py-2">
                              Debit
                            </th>
                            <th className="text-end bg-primary text-white  py-2">
                              Credit
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {balances.map((acc, key) => (
                            <tr key={key}>
                              <td>{key + 1}</td>
                              <td>{acc.accountName}</td>
                              <td className="text-end">
                                {acc.typeStatus == "debit" && acc.balance}
                              </td>
                              <td className="text-end">
                                {acc.typeStatus == "credit" && acc.balance}
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td>Total</td>
                            <td></td>
                            <td className="text-end">
                              {balances
                                .map((b) => ({
                                  ...b,
                                  debit:
                                    b.typeStatus == "debit"
                                      ? b.balance
                                      : "0.00",
                                  credit:
                                    b.typeStatus == "credit"
                                      ? b.balance
                                      : "0.00",
                                }))
                                .reduce((a, c) => a + parseFloat(c.debit), 0)
                                .toFixed(2)}
                            </td>
                            <td className="text-end">
                              {balances
                                .map((b) => ({
                                  ...b,
                                  debit:
                                    b.typeStatus == "debit"
                                      ? b.balance
                                      : "0.00",
                                  credit:
                                    b.typeStatus == "credit"
                                      ? b.balance
                                      : "0.00",
                                }))
                                .reduce((a, c) => a + parseFloat(c.credit), 0)
                                .toFixed(2)}
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

export default TrialBalance;
