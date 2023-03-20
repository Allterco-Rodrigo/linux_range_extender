// ------------------------------------- //
//                                       //
// THIS MUST RUN ON LINUX MACHINES ! ! ! //
//                                       //
// ------------------------------------- //

// REMEMBER TO EXECUTE ! ! !
//
// chmod +x search_shellyht.sh
// chmod +x search_ShellyPlugUS.sh 

import fetch from 'node-fetch';
import { exec } from 'child_process'
import fs from 'fs';


// Find broadcasting PLUG US that will be our Range Extender
const RANGE_EXTENDER = "ShellyPlugUS";
const CLIENT_EXT = "shellyht";

let SHELLY_HOST = [];
let SHELLY_CLIENTS = [];
let CONFIG_SSID = "";
let CONFIG_PASS = "";
const delay = 5000;

function list_available_ssids () {
    console.log('Searching for Available SSIDs in the Network\n')
    
    try {
        exec('./search_ssid.sh',(err, stdout, stderr) => {
            if(err){
                console.error(err)
                return;
            }
//            console.log(`stdout: ${stdout}`)
//            console.log(`stderr: ${stderr}`)
        })
        console.log('ssid_list.txt created\n')
    } catch (error) {
        console.log('Error Creating File',error)
    }

}

function read_ssid_list_file () {

    // read from file and set the SHELLY_SSID array

    console.log('Reading ssid_list.txt\n')

    const filePathHost = './ssid_list.txt';

    // Open the file and read its contents
    const fileContentsHost = fs.readFileSync(filePathHost, 'utf-8');

    // Split the contents into an array of lines
    const linesHost = fileContentsHost.split('\n');

    linesHost.forEach(element => {        
        console.log(element)
        element.toLowerCase().includes(RANGE_EXTENDER.toLowerCase)
        ? SHELLY_HOST.push(element.slice(1,-1))
        : element.toLowerCase().includes(CLIENT_EXT.toLowerCase)
          ? SHELLY_CLIENTS.push(element.slice(1,-1))
          : ""        
    });

}

// PROVISIONING FUNCTIONS

function connectToSSID (SSID) {
    try {
        exec(`sudo nmcli dev wifi connect ${SSID}`,(err, stdout, stderr) => {
            if(err){
                console.error(err)
                return;
            }
//            console.log(`stdout: ${stdout}`)
//            console.log(`stderr: ${stderr}`)
        })
        console.log(`Connected to`,SSID)
    } catch (error) {
        console.log('Error Creating File',error)
    }    
}

async function set_RANGE_EXTENDER_HOST_wifi_credentials (WIFI_SSID,WIFI_PASS) {
    try {
        console.log("Setting HOST WIFI Credentials\n")
        const response = await fetch(`http://192.168.33.1/rpc/WiFi.SetConfig?config={"sta":{"ssid":"${WIFI_SSID}","pass":"${WIFI_PASS}","enable":true}}`)
        // const ret = await response.json()
        // return true
    } catch (error) {
        console.error("ERROR \n\n",error)
    }
}

async function set_RANGE_EXTENDER_CLIENT_wifi_credentials (HOST_SSID) {
    try {
        console.log("Setting CLIENT WIFI Credentials\n")
        const response = await fetch(`http://192.168.33.1/rpc/WiFi.SetConfig?config={"sta":{"ssid":"${HOST_SSID}","pass":"","enable":true}}`)
        // const ret = await response.json()
        // return true
    } catch (error) {
        console.error("ERROR \n\n",error)
    }
}

function provision () {
    console.log('\nHost:',SHELLY_HOST[0]);
    console.log('Client:',SHELLY_CLIENTS[0]);
     return
    // connect to RANGE_EXTENDER_HOST
    setTimeout(()=>{connectToSSID(SHELLY_HOST[0])},delay+20000)

    // provision host
    setTimeout(()=>{set_RANGE_EXTENDER_HOST_wifi_credentials(CONFIG_SSID,CONFIG_PASS)},delay+30000)

    SHELLY_CLIENTS.forEach((element,index) => {
        console.log('Provisioning device',element,'-',index + 1,'of',SHELLY_CLIENTS.length)

        // connect to RANGE_EXTENDER_CLIENT
        setTimeout(()=>{connectToSSID(element)},delay+40000)

        // provision client
        setTimeout(()=>{set_RANGE_EXTENDER_CLIENT_wifi_credentials(SHELLY_HOST[0])},delay+50000)
    });
    
}

// return a list of shelly devices broadcasting in the wireless network
list_available_ssids()
setTimeout(()=>{read_ssid_list_file()},delay)
// connect to each device for provisioning
setTimeout(()=>{provision()},delay+10000)


// Connect to the plug
// Enable Range Extender
// Get plug SSID

// Find all broadcasting HT
// Get HT SSID
// if credentials are not set
// Set wifi credentials to connect to Range Extender

// Check how many HTs are connected to the PLUG
// If less than 10 - Redo process

// ShellyPlugUS