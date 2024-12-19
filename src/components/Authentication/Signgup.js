import React, { useState } from 'react'
import { FormControl, FormLabel, Input, InputGroup, InputRightElement, Show, useStatStyles, VStack } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import { set } from 'mongoose'
import { Button } from '@chakra-ui/react'
import axios from "axios";
import {useHistory} from 'react-router-dom'
const Signgup = () => {
    const[show, setshow]= useState(false)
    const [name, setName] = useState()
    const [email, setEmail] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    const [pic, setPic] = useState();
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState(false)
    const toast = useToast()
    const handleClick = () => setshow(!show);
    const history = useHistory();

    const postDetails = (pics) => { 

        console.log('picsss',pics)
        setLoading(true);
        if (pics === undefined) {
            toast({
                title: "please Select an Image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "buttom",
               
            });
            return;
            
        }
        console.log('till',pics)

        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            console.log('yes')
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chat-app")
            data.append("cloud_name", "df1wa7u7s")
            fetch("https://api.cloudinary.com/v1_1/df1wa7u7s/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    console.log(data.url.toString());
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);

                });
            
             
        } else {
            toast({
                title: "please Select an Image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "buttom",
               
            });
            setLoading(false);

            return;
        }
    };

    const submitHandler = async () => {
        setLoading(true);
        console.log(name)
        console.log(email)
        console.log(password)
        console.log(confirmpassword)
        if ( !name || !email || !password || !confirmpassword) {
            toast({
                title: "please fill all the Feilds",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",

            });
            setLoading(false);

            return;

        }
        if (password !== confirmpassword) {
            toast({
                title: "password do not match",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",

                
            });
            return;

         }

        try {
            const config = {
                Headers: {
                    "Content-Type": "application/json",
                    
                },
                
            };
            const  data  = await axios.post("api/user/",
                { name, email, password, pic },
                config
            );

            console.log(data)

            toast({
                title: "Registration is successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",

            });
            console.log("helloo")
            localStorage.setItem('userInfo',JSON.stringify(data));
            setLoading(false);
            history?.push('/chats')
        
        } catch (error) {
            toast({
                title: "error Occured",
                description: error?.response?.data?.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            
       }
    };
    


    
  return (
    <VStack spacing="5px">
          <FormControl id='first-name' isRequired><FormLabel>
              </FormLabel>Name</FormControl>
                  <Input
                      placeholder='Enter your Name'
                      onChange={(e) => setName(e.target.value)}
          />
          <FormControl id='email' isRequired><FormLabel>
              </FormLabel>email</FormControl>
                  <Input
                      placeholder='Enter your email'
                      onChange={(e) => setEmail(e.target.value)}
                  />
              <FormControl id='password' isRequired><FormLabel>
          </FormLabel>password</FormControl>
          <InputGroup>
              <Input
              type={show ? "text":'password'}
                      placeholder='Enter your password'
                      onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                      {show ? "hide" : "show"}
                  </Button>
              </InputRightElement>
          </InputGroup>
<FormControl id='password' isRequired><FormLabel>
          </FormLabel>confirm password</FormControl>
          <InputGroup>
              <Input
              type={show ? "text":'password'}
                      placeholder='confirm password'
                      onChange={(e) => setConfirmpassword(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                      {show ? "hide" : "show"}
                  </Button>
              </InputRightElement>
          </InputGroup>

           <FormControl id='pic'><FormLabel>
          </FormLabel>Upload your Picture</FormControl>
          <InputGroup>
              <Input
                  type="file"
                  p={1.5}
                  accept='image/*'
                      onChange={(e) => postDetails(e.target.files[0])}
              />
              <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                      {show ? "hide" : "show"}
                  </Button>
              </InputRightElement>
          </InputGroup>
          <Button colorScheme="blue"
              width="100%"
              style={{ marginTop: 15 }}
              onClick={submitHandler}
              isLoading={loading}
          >
              Signgup
              
          </Button>
          

          
    </VStack>
  )
}

export default Signgup  