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
import { exit } from 'process';

// Find broadcasting PLUG US that will be our Range Extender
const RANGE_EXTENDER = "ShellyPlugUS";
const CLIENT_EXT = "shellyht";
const CLIENT_GEN = 1;

let SHELLY_HOST = [];
let SHELLY_CLIENT = [];
const delay = 5000;

function list_available_ssids () {
    console.log('Searching for Shelly Devices in the Network')
    
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

function provisionHost () {

    console.log('Listing Shelly Host')

    const filePathHost = './ssid_list.txt';

    // Open the file and read its contents
    const fileContentsHost = fs.readFileSync(filePathHost, 'utf-8');

    // Split the contents into an array of lines
    const linesHost = fileContentsHost.split('\n');
    
    // for each line we check if it is a Host or Client
    linesHost.forEach(element => {

        const ssid = element.slice(27,58)
        
        if(ssid.toLowerCase().includes(RANGE_EXTENDER.toLowerCase())){
            SHELLY_HOST[0]=ssid.trim()
        }
          
    });

    setTimeout(()=>{

        if(!SHELLY_HOST.length > 0){
            console.log('No Host Device Found.')
            exit(1)
        }
        
        provision_host()

    },5000)
}

function getClientFromFile () {

    console.log('Listing Shelly Client')

    const filePathHost = './ssid_list.txt';

    // Open the file and read its contents
    const fileContentsHost = fs.readFileSync(filePathHost, 'utf-8');

    // Split the contents into an array of lines
    const linesHost = fileContentsHost.split('\n');
    
    // for each line we check if it is a Host or Client
    linesHost.forEach(element => {

        const ssid = element.slice(27,58)
        if(ssid.toLowerCase().includes(RANGE_EXTENDER.toLowerCase())){
            SHELLY_HOST[0]= ssid.trim()
        }

        if(ssid.toLowerCase().includes(CLIENT_EXT.toLowerCase())){
            SHELLY_CLIENT.push(ssid.trim())
            console.log("Device found:",ssid.trim())
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
                console.error('Could not connect to device',SSID)
                return err.code
            }
        })
        // console.log(`Connected to`,SSID)
        return 0        
    } catch (error) {
        console.log('Error Creating File',error)
        return -1
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
        // console.log("Rebooting...")
        // console.log(command)
        fetch(command)
    } catch (error) {
        console.error("ERROR \n\n",error)
        return
    }
 
}

function update_RANGE_EXTENDER_firmware () {
    const gen = 2
    const command = `http://192.168.33.1/rpc/Shelly.Update?stage="stable"`
    try {
        console.log("Update Firmware - 15 sec wait\n\n!!! Turn on all devices to be provisioned now !!!")
        // console.log(command)
        fetch(command)
    } catch (error) {
        console.error("ERROR \n\n",error)
        return
    }
}

function set_HOST_wifi_credentials (WIFI_SSID,WIFI_PASS) {
    const gen = 2
    const commandWF = `http://192.168.33.1/rpc/WiFi.SetConfig?config={"sta":{"ssid":"${WIFI_SSID}","pass":"${WIFI_PASS}","enable":true}}`
    const commandRE = `http://192.168.33.1/rpc/WiFi.SetConfig?config={"ap":{"range_extender":{"enable":true}}}`
    try {
        // console.log("Setting HOST WIFI Credentials")
        // console.log(commandWF)
        setTimeout(()=>{fetch(commandWF)},1000)

        // console.log("Enabling HOST Range Extender")
        // console.log(commandRE)
        setTimeout(()=>{fetch(commandRE)},2000)

        setTimeout(()=>{
            rebootDevice(gen)
            // while the HOST reboots, we list all available clients
            list_available_ssids()
        },3000)
    } catch (error) {
        console.error("ERROR \n\n",error)
        return
    }
}

function set_CLIENT_wifi_credentials (HOST_SSID, gen) {
    let command
    if(gen === 1){
        command = `http://192.168.33.1/settings/sta?ssid=${HOST_SSID}&key=&enabled=1`
    } else {
        command = `http://192.168.33.1/rpc/WiFi.SetConfig?config={"sta":{"ssid":"${HOST_SSID}","pass":"","enable":true}}` 
    }
 
    try {
        // console.log("Setting CLIENT WIFI Credentials")
        // console.log(command)
        setTimeout(()=>{fetch(command)},1000)
        //fetch(command)
    } catch (error) {
        console.error("ERROR \n\n",error)
        return
    }

    // setTimeout(()=>{rebootDevice(gen)},2000)
}

function provision_host () {
    console.log('Provisioning HOST',SHELLY_HOST[0])

    // connect to RANGE_EXTENDER_HOST
    const retCode = connectToSSID(SHELLY_HOST[0])
    if(retCode !== 0)
        return

    setTimeout(()=>{update_RANGE_EXTENDER_firmware()},delay)

    // provision host with desired internet wifi credentials
    setTimeout(()=>{set_HOST_wifi_credentials(CONFIG_SSID,CONFIG_PASS)},delay*6)

}

function provision_client (i) {

    console.log(`Provisioning CLIENT #${i+1}`,SHELLY_CLIENT[i]);

    // connect to RANGE_EXTENDER_CLIENT
    const retCode = connectToSSID(SHELLY_CLIENT[i])
    if(retCode !== 0)
        return

    // provision client
    setTimeout(()=>{set_CLIENT_wifi_credentials(SHELLY_HOST[0],CLIENT_GEN)},delay)

}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function provisionClient() {
    rl.question('Do you want to start provisioning a new client? (y/n)', (answer) => {
        if (answer.toLowerCase() === 'y') {
            getClientFromFile()
            if(!SHELLY_CLIENT.length > 0){
                console.log('No devices to be set as client found.')
                provisionClient()
            } else {
                console.log(SHELLY_CLIENT.length,"devices found")
            }
            let outDelay = 0
            for (let i = 0; i < SHELLY_CLIENT.length; i++) {
                setTimeout(()=>{ provision_client(i) },delay*2*i)
            }
            setTimeout(()=>{ 
                console.log("All devices provisioned")
                console.timeEnd("program-time")
                exit(0)
            },delay*2*(SHELLY_CLIENT.length+1))
        } else if (answer.toLowerCase() === 'n') {
            console.log('Provisioning execution stopped by user.');
            console.timeEnd("program-time")
            exit(1)
        } else {
            console.log('Invalid input, please try again.');
            provisionClient();
        }
    }); 
}

function provision () {
    rl.question('Do you want to start provisioning a new host? (y/n)', (answer) => {
        if (answer.toLowerCase() === 'y') {
            // provision the host found 
            setTimeout(()=>{ provisionHost() },5000)
            // prompt user for directions
            setTimeout(()=>{ provision() },60000)
        } else if (answer.toLowerCase() === 'n') {
            console.log('End of Host Provisioning')
            setTimeout(()=>{
                console.log('\nStart provisioning Clients')
                provisionClient()   
            },5000)
        } else {
            console.log('Invalid input, please try again.');
            provision();
        }

    });
}

// --------------------------- START EXECUTION HERE 
console.time("program-time")
// return a list of all devices broadcasting in the wireless network
console.log('Provisioning Program Started')
list_available_ssids()
setTimeout(()=>{ provision() },5000)
