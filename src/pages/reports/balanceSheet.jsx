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
import "../invoice.css";
import axiosInstance from "../../services/axiosService";

const BalanceSheet = () => {
  //meta title
  document.title = "Balance Sheet - Report";

  //Print the Invoice
  const printInvoice = () => {
    window.print();
  };

  const [balances, setBalances] = useState(null);

  const fetchBalanceSheet = async () => {
    try {
      const { data } = await axiosInstance.post(`report/get_balance_sheet`);

      if (data.success) {
        const assets = data.report.filter((d) => d.type == "Asset");
        const liabilities = data.report.filter((d) => d.type == "Liability");
        const equities = data.report.filter((d) => d.type == "Equity");
        const netIncome = parseFloat(data.netIncome);

        setBalances({ assets, liabilities, equities, netIncome });
      }
    } catch (ex) {}
  };

  useEffect(() => {
    fetchBalanceSheet();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="Reports" breadcrumbItem="Trail Balance" />
          {balances && (
            <Row>
              <Col lg={12}>
                <Card className="" style={{ boxShadow: "none" }}>
                  <CardBody className="">
                    <div className="invoice-title">
                      <h4 className="float-end font-size-16">Balance Sheet</h4>
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
                              Account
                            </th>
                            <th className="bg-primary text-white py-2"></th>
                            <th className="text-end bg-primary text-white  py-2">
                              Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <h5 className="mb-0">Assets</h5>
                            </td>
                            <td></td>
                            <td className="text-end"></td>
                          </tr>
                          {balances.assets.map((asset, key) => (
                            <tr key={key}>
                              <td className="" style={{ paddingLeft: 25 }}>
                                {asset.accountName}
                              </td>
                              <td></td>
                              <td className="text-end">{asset.balance}</td>
                            </tr>
                          ))}
                          <tr>
                            <td
                              className="text-primary"
                              style={{ paddingLeft: 25 }}
                            >
                              Total Assets
                            </td>
                            <td></td>
                            <td className="text-end text-primary">
                              {balances.assets
                                .reduce((a, c) => a + parseFloat(c.balance), 0)
                                .toFixed(2)}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <h5 className="mb-0">Liabilities</h5>
                            </td>
                            <td></td>
                            <td className="text-end"></td>
                          </tr>
                          {balances.liabilities.map((acc, key) => (
                            <tr key={key}>
                              <td className="" style={{ paddingLeft: 25 }}>
                                {acc.accountName}
                              </td>
                              <td></td>
                              <td className="text-end">{acc.balance}</td>
                            </tr>
                          ))}
                          <tr>
                            <td
                              className="text-primary"
                              style={{ paddingLeft: 25 }}
                            >
                              Total Liabilities
                            </td>
                            <td></td>
                            <td className="text-end text-primary">
                              {balances.liabilities
                                .reduce((a, c) => a + parseFloat(c.balance), 0)
                                .toFixed(2)}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <h5 className="mb-0">Equities</h5>
                            </td>
                            <td></td>
                            <td className="text-end"></td>
                          </tr>
                          {balances.equities.map((acc, key) => (
                            <tr key={key}>
                              <td className="" style={{ paddingLeft: 25 }}>
                                {acc.accountName}
                              </td>
                              <td></td>
                              <td className="text-end">{acc.balance}</td>
                            </tr>
                          ))}
                          {balances.netIncome && (
                            <tr>
                              <td className="" style={{ paddingLeft: 25 }}>
                                Net Income
                              </td>
                              <td></td>
                              <td className="text-end">
                                {balances.netIncome.toFixed(2)}
                              </td>
                            </tr>
                          )}

                          <tr>
                            <td
                              className="text-primary"
                              style={{ paddingLeft: 25 }}
                            >
                              Total Equities
                            </td>
                            <td></td>
                            <td className="text-end text-primary">
                              {balances.equities
                                .reduce(
                                  (a, c) => a + parseFloat(c.balance),
                                  balances.netIncome
                                )
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
                          <i className="fa fa-print me-2" /> Print
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

export default BalanceSheet;
