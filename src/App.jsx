import PropTypes from "prop-types";
import React, { createContext, useEffect, useState } from "react";

import { Routes, Route, useLocation } from "react-router-dom";
import { connect } from "react-redux";

import { useSelector } from "react-redux";
import { createSelector } from "reselect";

// Import Routes all
import { authProtectedRoutes, publicRoutes } from "./routes";

// Import all middleware
import Authmiddleware from "./routes/route";

// layouts Format
import VerticalLayout from "./components/VerticalLayout/";
import HorizontalLayout from "./components/HorizontalLayout/";
import NonAuthLayout from "./components/NonAuthLayout";

// Import scss
import "./assets/scss/theme.scss";

// Import Firebase Configuration file
// import { initFirebaseBackend } from "./helpers/firebase_helper"

import fakeBackend from "/src/helpers/AuthType/fakeBackend";
import axiosInstance from "./services/axiosService";
import { at } from "lodash";
import { jwtDecode } from "jwt-decode";

// Activating fake backend
fakeBackend();

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_APP_APIKEY,
//   authDomain: import.meta.env.VITE_APP_AUTHDOMAIN,
//   databaseURL: import.meta.env.VITE_APP_DATABASEURL,
//   projectId: import.meta.env.VITE_APP_PROJECTID,
//   storageBucket: import.meta.env.VITE_APP_STORAGEBUCKET,
//   messagingSenderId: import.meta.env.VITE_APP_MESSAGINGSENDERID,
//   appId: import.meta.env.VITE_APP_APPID,
//   measurementId: import.meta.env.VITE_APP_MEASUREMENTID,
// };

// init firebase backend
// initFirebaseBackend(firebaseConfig)
export const LoggedUserContext = createContext();
export const UrlActionContext = createContext();

const App = (props) => {
  const selectLayoutState = (state) => state.Layout;
  const LayoutProperties = createSelector(selectLayoutState, (layout) => ({
    layoutType: layout.layoutType,
  }));

  const { layoutType } = useSelector(LayoutProperties);

  function getLayout(layoutType) {
    let layoutCls = VerticalLayout;
    switch (layoutType) {
      case "horizontal":
        layoutCls = HorizontalLayout;
        break;
      default:
        layoutCls = VerticalLayout;
        break;
    }
    return layoutCls;
  }

  const Layout = getLayout(layoutType);

  const token = localStorage.getItem("accessToken");

  const location = useLocation();
  const [urlActions, setUrlActions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUrlActions = async (token) => {
    const { data } = await axiosInstance.post("permissions/get_url_actions", {
      url: location.pathname.substring(1),
      userId: token.user.id,
    });

    if (data.success) {
      setUrlActions(data.actions.map((act) => act.title));
    }
  };

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setCurrentUser(decodedToken.user);
      fetchUrlActions(decodedToken);
    }
  }, [location, token]);

  return (
    <React.Fragment>
      <LoggedUserContext.Provider value={currentUser}>
        <UrlActionContext.Provider value={urlActions}>
          <Routes>
            {publicRoutes.map((route, idx) => (
              <Route
                path={route.path}
                element={<NonAuthLayout>{route.component}</NonAuthLayout>}
                key={idx}
                exact={true}
              />
            ))}

            {authProtectedRoutes.map((route, idx) => (
              <Route
                path={route.path}
                element={
                  <Authmiddleware>
                    <Layout>{route.component}</Layout>
                  </Authmiddleware>
                }
                key={idx}
                exact={true}
              />
            ))}
          </Routes>
        </UrlActionContext.Provider>
      </LoggedUserContext.Provider>
    </React.Fragment>
  );
};

App.propTypes = {
  layout: PropTypes.any,
};

const mapStateToProps = (state) => {
  return {
    layout: state.Layout,
  };
};

export default connect(mapStateToProps, null)(App);
