// ------------------------------------- //
//                                       //
// THIS MUST RUN ON LINUX MACHINES ! ! ! //
//                                       //
// ------------------------------------- //

// REMEMBER TO EXECUTE ! ! !
//
// chmod +x search_ssid.sh


import fetch from 'node-fetch';
import { exec } from 'child_process'
import fs from 'fs';
import { CONFIG_PASS, CONFIG_SSID } from './config.js';
import * as readline from 'node:readline';

// Find broadcasting PLUG US that will be our Range Extender
const RANGE_EXTENDER = "ShellyPlugUS";
const CLIENT_EXT = "shellyht";
const CLIENT_GEN = 1;

let SHELLY_HOST = [];
let SHELLY_CLIENTS = [];
const delay = 5000;

function list_available_ssids () {
    console.log('Searching for Available SSIDs in the Network')
    
    try {
        exec('./search_ssid.sh',(err, stdout, stderr) => {
            if(err){
                console.error(err)
                return;
            }
        })
    } catch (error) {
        console.log('Error Creating SSID File',error)
    }

}

function read_ssid_list_file () {

    console.log('Reading ssid_list.txt')

    const filePathHost = './ssid_list.txt';

    // Open the file and read its contents
    const fileContentsHost = fs.readFileSync(filePathHost, 'utf-8');

    // Split the contents into an array of lines
    const linesHost = fileContentsHost.split('\n');

    // for each line we check if it is a Host or Client
    linesHost.forEach(element => {

        const ssid = element.slice(27,60)

        if(ssid.toLowerCase().includes(RANGE_EXTENDER.toLowerCase())){
            SHELLY_HOST.push(ssid.trim())
            console.log("Host:",ssid.trim())
        }


        if(ssid.toLowerCase().includes(CLIENT_EXT.toLowerCase())){
            SHELLY_CLIENTS.push(ssid.trim())
            console.log("Client:",ssid.trim())
        }
          

    });

}

function delete_ssid_file () {
    try {
        exec('./delete_ssid_file.sh',(err, stdout, stderr) => {
            if(err){
                console.error(err)
                return;
            }
        })
    } catch (error) {
        console.log('Error Deleting SSID File',error)
    }    
}

// PROVISIONING FUNCTIONS

function connectToSSID (SSID) {
    try {
        exec(`sudo nmcli dev wifi connect ${SSID}`,(err, stdout, stderr) => {
            if(err){
                console.error(err)
                return;
            } else {
                console.log(`Connected to`,SSID)
            }
        })
    } catch (error) {
        console.log('Error Creating File',error)
    }    
}

function rebootDevice(gen){
    let command
    if(gen === 1){
        command = `http://192.168.33.1/reboot`
    } else {
        command = `http://192.168.33.1/rpc/Shelly.Reboot` 
    }
    
    try {
        console.log("Rebooting...\n")
        console.log(command)
        fetch(command)
    } catch (error) {
        console.error("ERROR \n\n",error)
        return
    }
 
}

function update_RANGE_EXTENDER_firmware () {
    const gen = 2
    const command = `http://192.168.33.1/rpc/Shelly.Update`
    try {
        console.log("Update Firmware - 15 sec wait")
        console.log(command)
        fetch(command)
    } catch (error) {
        console.error("ERROR \n\n",error)
        return
    }
}

function set_RANGE_EXTENDER_HOST_wifi_credentials (WIFI_SSID,WIFI_PASS) {
    const gen = 2
    const command = `http://192.168.33.1/rpc/WiFi.SetConfig?config={"sta":{"ssid":"${WIFI_SSID}","pass":"${WIFI_PASS}","enable":true},"ap":{"range_extender":{"enable":true}}}`
    try {
        console.log("Setting HOST WIFI Credentials")
        console.log(command)
        fetch(command)
        setTimeout(()=>{rebootDevice(gen)},1000)
    } catch (error) {
        console.error("ERROR \n\n",error)
        return
    }
}

function set_RANGE_EXTENDER_CLIENT_wifi_credentials (HOST_SSID, gen) {
    let command
    if(gen === 1){
        command = `http://192.168.33.1/settings/sta?ssid=${HOST_SSID}&key=&enabled=1`
    } else {
        command = `http://192.168.33.1/rpc/WiFi.SetConfig?config={"sta":{"ssid":"${HOST_SSID}","pass":"","enable":true}}` 
    }
 
    try {
        console.log("Setting CLIENT WIFI Credentials")
        console.log(command)
        fetch(command)
    } catch (error) {
        console.error("ERROR \n\n",error)
        return
    }

    // setTimeout(()=>{rebootDevice(gen)},2000)
}

function provision_host () {
    console.log('Provisioning HOST',SHELLY_HOST[0])

    // connect to RANGE_EXTENDER_HOST
    connectToSSID(SHELLY_HOST[0])

    setTimeout(()=>{update_RANGE_EXTENDER_firmware},delay)

    // provision host with desired internet wifi credentials
    setTimeout(()=>{set_RANGE_EXTENDER_HOST_wifi_credentials(CONFIG_SSID,CONFIG_PASS)},delay*6)

}

function provision_clients (ind) {

    console.log('Provisioning CLIENT');

    // connect to RANGE_EXTENDER_CLIENT
    connectToSSID(SHELLY_CLIENTS[ind])

    // provision client
    setTimeout(()=>{set_RANGE_EXTENDER_CLIENT_wifi_credentials(SHELLY_HOST[0],CLIENT_GEN)},delay)

}


// --------------------------- START EXECUTION HERE 

// // return a list of all devices broadcasting in the wireless network
// list_available_ssids()

// // from the list created we select only the shelly devices we want and assign host and clients
// setTimeout(()=>{read_ssid_list_file()},2000)

// // run provision of host and clients
// setTimeout(()=>{
//     if (SHELLY_HOST.length !== 0) {

//         if (SHELLY_CLIENTS.length !== 0){
//             console.log("Provisioning...\n")
//             setTimeout(()=>{provision_host()},delay)

//         } else 
//             console.log('No clients found')

//     } else {
//         console.log('No host found')
//     }
// },delay+5000)

// setTimeout(()=>{provision_clients()},delay+25000)


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let counter = 0;

function myFunction(counter) {
  provision_clients(counter)
}

function promptUser() {
  if (counter < 10) {
    rl.question('Do you want to start provisioning a device? (y/n) ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        myFunction(counter);
        counter++;
        promptUser();
      } else if (answer.toLowerCase() === 'n') {
        console.log('Provisioning execution stopped by user.');
        rl.close();
      } else {
        console.log('Invalid input, please try again.');
        promptUser();
      }
    });
  } else {
    console.log('Provisioning finished. Exiting program.');
    rl.close();
  }
}

promptUser();
