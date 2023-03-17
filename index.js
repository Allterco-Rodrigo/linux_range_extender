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

// return a list of shelly devices available in the wifi
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

// bring back the values from the file
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

// connect to each device for provisioning
function provision () {
    // connect to host
    
    SHELLY_HOST[0]
    //
    // provision host

    // provision clients
    SHELLY_CLIENTS
}


ssid_list()
const delay = 20000
setTimeout(()=>{read_file()},delay)
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

ShellyPlugUS