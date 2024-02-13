import { Search, Map} from "./Search"
import {Button, Card, Typography, TextField} from '@mui/material'

function Landing(){
    return (
        <div style={{backgroundImage:'url("/src/assets/background.jpg")', height:"100%", margin:"-10px -10px"}}>
            <br /><br />
            <Header />
            <Info />
            <Search />


        </div>
    )

}

function Header(){
    return(
        <div style={{ margin: "10px 100px",height: "111px", backgroundColor: "#4257f5", padding:"20px 40px 8px 40px", borderRadius:"10px", boxShadow:"0px 3px 10px 1px" }}>
            <div style={{display: "flex", justifyContent: "space-between", borderBottom:"solid 2px black"}}>
                <div style={{display: "flex", justifyContent: "space-around"}}>
                    <div style={{margin:"0px 15px 0px 5px"}}><img height="35px" src="./src/assets/logo2.jpg"/></div>
                    <div><Typography variant ="h4" align="center" style={{color:"white"}}>Abc.net</Typography></div>
                </div>    
                <div style={{marginTop:"20px"}}>
                    <Typography align="center" style={{color:"white"}}>An application to tell temperatures for places worldwide</Typography>
                </div>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", marginTop:"10px" }}>
                <div style={{display: "flex", justifyContent: 'space-between', alignItems:"center", marginTop: -15}}>
                    <div><Button variant="text"  style={{color:"white", paddingRight:"10px"}} >Home</Button></div>
                    <div><Button variant="text"  style={{color:"white", paddingRight:"10px"}} >User Guide</Button></div>
                    <div><Button variant="text"  style={{color:"white", paddingRight:"10px"}} >License & Citation</Button></div>
                    <div><Button variant="text"  style={{color:"white", paddingRight:"10px"}} >About</Button></div>
                    {/* <Button variant ="text" style={{paddingTop: "8px"}}>{mail}</Button> */}
                    {/* <Button size ="small" variant ="contained" onClick={()=>{
                        localStorage.setItem('token', null)
                        navigate("/signup")}}>Logout</Button> */}
                </div>
                <div style={{margin:"-5px 40px 0px 0px"}}>
                    <img height="60px" src="./src/assets/logo.png" />
                </div>
            </div>
            <br /> <br />
        </div>
    )
}
function Info(){
    return(
        <div align="center" style={{margin:"-30px 0px 0px 20px"}}>
            <Card variant={"outlined"} style={{width: 1100, minHeight : 400, padding:"20px 5px", marginRight:"20px", marginTop: "50px",borderRadius: "8px", boxShadow:"0px 2px 5px 1px" }}>
                <div style={{display:"flex", justifyContent:"space-between"}}>
                    <div style={{padding:"0px 15px"}}>
                        <Typography variant="h2" align="center" >abc</Typography>
                        <br />
                        <Typography variant="h6" align="center" style={{marginTop:-8}}>Climate Data Online (CDO) provides free access to NCDC's archive of global historical weather and climate data in addition to station history information. These data include quality controlled daily, monthly, seasonal, and yearly measurements of temperature, precipitation, wind, and degree days as well as radar data and 30-year Climate Normals. Customers can also order most of these data as certified hard copies for legal use.</Typography><br />
                    </div>
                    <div style={{padding:"50px 20px"}}>
                        <img src ="./src/assets/logo2.jpg"/>

                    </div>
                </div>
                <div >
                    <div style={{backgroundColor:"#454143", margin:"0px 40px 0px 36px", padding:"3px 25px"}}>
                        <Typography variant="h6" align="left" style={{color:"white"}}>DISCOVER DATA BY</Typography>
                    </div>
                    <div style ={{display:"flex", justifyContent:"center"}}>
                        <Card variant={"outlined"} style={{backgroundColor: "#4E8CC7",width: 327, minHeight : 10, padding:"20px 5px", marginRight:"4px", marginTop: "10px", color:"white"}}><b>SEARCH TOOL</b></Card>
                        <Card variant={"outlined"} style={{backgroundColor: "#D4730B",width: 327, minHeight : 10, padding:"20px 5px", marginRight:"4px", marginTop: "10px", color:"white"}}><b>MAPPING TOOL</b></Card>
                        <Card variant={"outlined"} style={{backgroundColor: "#891B00",width: 327, minHeight : 10, padding:"20px 5px", marginRight:"4px", marginTop: "10px", color:"white"}}><b>DATA TOOL</b></Card>
                    </div>
                </div>
                <br />
                {/* <div style={{display: "flex", justifyContent:"center"}}>
                    <Button variant={'contained'} size="small" style={{marginTop: 1}}
                                onClick={async ()=>{
                                    
                                }}
                    >TRY</Button>
                </div> */}
            </Card>
        </div>
    )
}
export default Landing;