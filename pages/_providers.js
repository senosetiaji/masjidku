import { Provider } from "react-redux";
import store from "@/store";
import PropTypes from 'prop-types'

export default function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}

Providers.propTypes = {
  children: PropTypes.node,
};