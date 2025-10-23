import React, { FC, StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { IComponent } from "@mendix/extensions-api";
import axios from "axios";

export interface findingProps {
    id: string;
    name: string;
    status: string;
}

interface Dictionary<T> {
    [Key: string]: T;
}

export function SigridFindings() {

    let initialFindings = [
        { name: 'Dummy', id: '1', status: 'Dummy', date: new Date(1991, 1, 1) },
    ];
    const [currentFindingList, setCurrentFindingList] = useState(initialFindings);
    const [analysisDate, setAnalysisDate] = useState("N/A");
    const [debugText, setDebugText] = useState("");


    function getSigridSettings() {
        var storedToken = localStorage.getItem('sigridToken');
        var storedCustomer = localStorage.getItem('sigridCustomer');
        var storedSystem = localStorage.getItem('sigridSystem');
        if(storedToken && storedCustomer && storedSystem) {
            return {token: storedToken, customer: storedCustomer, system: storedSystem};
        }
        else {
            throw new Error("No Sigrid Token configured");
        }
    }

    const loadFindings = async() => {
        setDebugText("Loading findings...");

        var settings = {token: "", customer: "", system: ""};
        try{
            settings = getSigridSettings();
        }
        catch(e) {
            setDebugText("No Sigrid token, customer and system configured. Add one in the configuration page first");
            return;
        }
        
        const axiosConfig = {
            headers: {
                'Authorization': 'Bearer ' + settings.token
            }
        }
        // TODO: Paginate findings
        axios.get("https://sigrid-says.com/rest/analysis-results/api/v1/security-findings/" + settings.customer + "/" + settings.system, axiosConfig)
            .then((response: any) => {
                const newFindings2 = response.data.map((dataRow: any) => {
                    return {id: dataRow.id, name: dataRow.type, status: dataRow.status, date: new Date(dataRow.lastSeenSnapshotDate)}
                });
                setCurrentFindingList(newFindings2);
                setDebugText("");
                var aDate = newFindings2.reduce((a: Dictionary<string>, b: Dictionary<string>) => {
                    if(a.date > b.date) {
                        return a.date;
                    }
                    return b.date;
                });
                setAnalysisDate(aDate.toDateString());
            })
            .catch(function(error: any) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    // TODO: Better error message
                    setDebugText("error " + error.response.status);
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    // TODO: Better error message
                    console.log(error.request);
                    setDebugText("error " + error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    // TODO: Better error message
                    setDebugText("error " + error.message);
                    console.log('Error', error.message);
                }
            });
    }
    
    const rows = currentFindingList.map(finding =>
        <FindingRow 
            key={finding.id}
            id={finding.id}
            name={finding.name}
            status={finding.status}/>);

    return (
        <div>
            <div>Analysis date: <span>{analysisDate}</span></div>
            <table id="sigridFindings" style={{border: "1px solid rgb(0, 0, 0)"}}>
                <thead>
                    <tr><th>ID</th><th>Type</th><th>Finding</th></tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            <button onClick={loadFindings}>Load/refresh findings</button>
            <span>{debugText}</span>
        </div>
    );
}

const FindingRow: FC<findingProps> = ({id, name, status}) => {
    return (
        <tr><td>{id}</td><td>{name}</td><td>{status}</td></tr>
    );
}

export const component: IComponent = {
    async loaded(componentContext) {
        createRoot(document.getElementById("root")!).render(
            <StrictMode>
                <h1>QSM Findings</h1>
                <p>See the QSM Security findings for your system!</p>
                <SigridFindings/>
            </StrictMode>
        );
    }
}
