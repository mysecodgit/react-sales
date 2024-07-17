import React from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { Container } from "reactstrap";
import Breadcrumbs from "/src/components/Common/Breadcrumb";

const ExcelExport = () => {
  const points = [
    {
      qty: 10,
      unit: 31.31,
    },
    {
      qty: 10,
      unit: 28,
    },
    { qty: 400, unit: 7.82 },
    { qty: 600, unit: 10.6 },
    { qty: 960, unit: 1.06 },
    { qty: 1000, unit: 1.07 },
    { qty: 1200, unit: 2.15 },
    { qty: 240, unit: 5.75 },
    { qty: 1000, unit: 2 },
    { qty: 100, unit: 12.95 },
  ];

  const dividerRule = 3.667;
  const mutiplier = parseFloat((22.579781421 / 100).toFixed(10));

  console.log("multiplier ", mutiplier);

  const data = points.map((point, index) => {
    const toUsd = (point.unit / dividerRule).toFixed(10);
    const a = parseFloat(toUsd) * mutiplier;

    const conversion = ((point.unit * point.qty) / dividerRule).toFixed(10);
    const qarash = parseFloat(conversion) * mutiplier;
    const totalResult = parseFloat(conversion) + qarash;
    let toFixedNum = 11 - point.qty.toString().length;
    // let unitPrice = (totalResult.toFixed(10) / point.qty).toFixed(10);
    let unitPrice = (parseFloat(toUsd) + a).toFixed(10);

    return {
      no: index + 1,
      qty: point.qty,
      DIRHAM_RATE: point.unit,
      // USD_RATE: unitPrice,
      USD_RATE_WITHOUT: parseFloat(toUsd),
      TOTAL_WITHOUT_RATE: parseFloat(toUsd) * point.qty,
      //   unit: point.unit,
      //   amountAED: point.qty * point.unit,
      //   price: conversion,
      // TOTAL_WITH_RATE: parseFloat((unitPrice * point.qty).toFixed(toFixedNum)),
    };
  });

  let totaltotal = parseFloat(
    data.reduce((a, c) => a + parseFloat(c.TOTAL_WITHOUT_RATE), 0).toFixed(10)
  );

  data.push({
    no: "Total",
    qty: "",
    price: data.reduce((a, c) => a + parseFloat(c.price), 0) || "",
    TOTAL_WITHOUT_RATE: totaltotal,
    // TOTAL_WITH_RATE: parseFloat(
    //   data.reduce((a, c) => a + parseFloat(c.TOTAL_WITH_RATE), 0).toFixed(10)
    // ),
  });

  data.push({
    no: "Total after %",
    qty: "",
    price: data.reduce((a, c) => a + parseFloat(c.price), 0) || "",
    TOTAL_WITHOUT_RATE: totaltotal + totaltotal * parseFloat(mutiplier),
    // TOTAL_WITH_RATE: parseFloat(
    //   data.reduce((a, c) => a + parseFloat(c.TOTAL_WITH_RATE), 0).toFixed(10)
    // ),
  });

  console.log(data);

  const fileName = "shihhi company";
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <>
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            {/* Render Breadcrumbs */}
            <Breadcrumbs title="People" breadcrumbItem="Expenses" />
            <button onClick={exportToExcel}>Export to Excel</button>;
          </Container>
        </div>
      </React.Fragment>
    </>
  );
};

export default ExcelExport;
