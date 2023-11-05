import React,{useEffect,useState} from 'react'
import axiosInstance from 'src/helper/AxiosInstance'
import CurrencyFormatter from 'src/helper/CurrencyFormatter'

const ConvertCurrenct = (props:any) => {
    const [price,setPrice] = useState(0)
    const convertShipCurrency = async(from:string,amount:any)=>{
        if(Number(amount)){
          const {data} = await axiosInstance.get(`/products/v1/converter/currncey?from=${from}&amount=${amount}`,{maxRedirects:1}) 
          setPrice(data.price)
        }
      }
    useEffect(()=>{
        convertShipCurrency(props.from,props.amount)
    },[])
    
  return (
    <div>{CurrencyFormatter(price)}</div>
  )
}

export default ConvertCurrenct