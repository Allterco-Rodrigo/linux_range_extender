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
let SHELLY_HOST = [];
let SHELLY_CLIENTS = [];
let CONFIG_SSID = "";
let CONFIG_PASS = "";
const delay = 20000;


function ssid_list () {
    console.log('Searching for device in the Network \n')
    
    try {
        exec('./search_ShellyPlugUS.sh',(err, stdout, stderr) => {
            if(err){
                console.error(err)
                return;
            }
//            console.log(`stdout: ${stdout}`)
//            console.log(`stderr: ${stderr}`)
        })
        console.log('ShellyPlugUS_broadcasting.txt created')
    } catch (error) {
        console.log('Error Creating File',error)
    }

    try {
        exec('./search_shellyht.sh',(err, stdout, stderr) => {
            if(err){
                console.error(err)
                return;
            }
//            console.log(`stdout: ${stdout}`)
//            console.log(`stderr: ${stderr}`)
        })
        console.log('shellyht_broadcasting.txt created')
    } catch (error) {
        console.log('Error Creating File',error)
    }


};

function read_file () {

    const filePathHost = './shelly_devices_broadcasting.txt';

    // Open the file and read its contents
    const fileContentsHost = fs.readFileSync(filePathHost, 'utf-8');

    // Split the contents into an array of lines
    const linesHost = fileContentsHost.split('\n');

    // Log each line to the console
    for (const line of linesHost) {
//        console.log('Reading from file',line)
        SHELLY_HOST.push(line)
    }


    const filePath = './shelly_devices_broadcasting.txt';

    // Open the file and read its contents
    const fileContents = fs.readFileSync(filePath, 'utf-8');

    // Split the contents into an array of lines
    const lines = fileContents.split('\n');

    // Log each line to the console
    for (const line of lines) {
//        console.log('Reading from file',line)
        SHELLY_CLIENTS.push(line)
    }

}

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
        const ret = await response.json()
        return true
    } catch (error) {
        console.error("ERROR \n\n",error)
    }
}

async function set_RANGE_EXTENDER_CLIENT_wifi_credentials (HOST_SSID) {
    try {
        console.log("Setting CLIENT WIFI Credentials\n")
        const response = await fetch(`http://192.168.33.1/rpc/WiFi.SetConfig?config={"sta":{"ssid":"${HOST_SSID}","pass":"","enable":true}}`)
        const ret = await response.json()
        return true
    } catch (error) {
        console.error("ERROR \n\n",error)
    }
}

function provision () {
    
    // connect to RANGE_EXTENDER_HOST
    setTimeout(()=>{connectToSSID(SHELLY_HOST[0])},delay)

    // provision host
    setTimeout(()=>{set_RANGE_EXTENDER_HOST_wifi_credentials(CONFIG_SSID,CONFIG_PASS)},delay)

    SHELLY_CLIENTS.forEach((element,index) => {
        console.log('Provisioning device',element,'-',index + 1,'of',SHELLY_CLIENTS.length)

        // connect to RANGE_EXTENDER_CLIENT
        setTimeout(()=>{connectToSSID(element)},delay)

        // provision client
        setTimeout(()=>{set_RANGE_EXTENDER_CLIENT_wifi_credentials(SHELLY_HOST[0])},delay)
    });
    
}

// return a list of shelly devices available in the wifi 
ssid_list()

// bring back the values from the file
setTimeout(()=>{read_file()},delay)

// connect to each device for provisioning
setTimeout(()=>{provision()},delay)


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