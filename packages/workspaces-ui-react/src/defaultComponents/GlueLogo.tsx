import React from "react";
import { GlueLogoProps } from "../types/internal";

const GlueLogo: React.FC<GlueLogoProps> = ({ frameId, ...props }) => {
    return (
        <span {...props} className={"logo_type"}>
        </span>
    )
};

export default GlueLogo;
