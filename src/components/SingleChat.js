import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box ,FormControl,IconButton,Input,Spinner,Text, Toast, useToast} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender,getSenderFull } from '../config/ChatLogics';
import ProfileModal from './miscelleneous/profileModal';
import UpdateGroupChatModal from './miscelleneous/UpdateGroupChatModal';
import axios from 'axios';
import './styles.css';
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json"

const ENDPOINT = "http://localhost:5000";
var socket, SelectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain}) => {
    const [message, setMessage] = useState([])
    const [loading, setLoading] = useState([]);
    const [newMessage, setNewMessage] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false)
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        renderSettings: {
            preserveAspectRation: "xMidYmid slice",
        },
    };
    const Toast = useToast();

    const { user, SelectedChat, setSelectedChat ,notification,setNotification} = ChatState();

    const fetchMessages = async () => {
        if (!SelectedChat) return;
        try {
            const config = {
                headers: {
                    authorization: `Bearer ${user.token}`,
                },
            };
            setLoading(true)
            const { data } = await axios.get(`/api/message/${SelectedChat?._id}`,
                config);
            setMessage(data);
            setLoading(false)
            socket.emit('join chat', SelectedChat?._id);
        } catch (error) {
            Toast({
                title: "error Ocuurred",
                description: "failed to load the chats",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
        }
    };
    useEffect(() => {
        fetchMessages();
        SelectedChatCompare = SelectedChat;
    }, [SelectedChat]);

    useEffect(() => {
        socket?.on('message recived', (newMessageRecived) => {
            if (!SelectedChatCompare || SelectedChatCompare?._id !== newMessageRecived.chat?._id) {
                
                if (!notification.includes(newMessageRecived)) {
                    setNotification([newMessageRecived, ...notification])
                    setFetchAgain(!fetchAgain);
            }

            } else {
                setNewMessage([...message, newMessageRecived]);
            }
        
        });
    })

    const sendMessage = async(event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit('stop typing', SelectedChat?._id);
            try {
                const config = {
                    headers: {
                        "content-type": "application/json",
                        authorization: `Bearer ${user.token}`,
                    },
                };
                                setNewMessage("");

                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId:SelectedChat?._id,
                    },
                    config

                );
                console.log(data)
                socket.emit("new message", data);

                setMessage([...message, data]);
            } catch (error) {
                Toast({
                    title: "error occured",
                    description: "failed to send the mesasage",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                    
                })
            }
        }
    };
    
    useEffect(() => {
        socket = io(ENDPOINT)
        socket?.emit("setup", user);
        socket?.on("connected", () => setSocketConnected(true));
        socket?.on('typing', () => setIsTyping(true));
        socket?.on('stop typing',()=>setIsTyping(false))
    },)
    const typingHandler = (e) => {
        setNewMessage(e.target.value)

        if (!socketConnected) return;
        if (!typing) {
            setTyping(true)
            socket.emit('typing', SelectedChat?._id);
        }
        let lastTypingTime = new Date().getTime()
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit('stop typing', SelectedChat?._id);
                setTyping(false);
         }
        },timerLength);

        
     };


    console.log('selll',SelectedChat)
  return (
      <>{
        SelectedChat ? (
              <>
                  <Text
                      fontSize={{ base: "28px", md: "30px" }}
                      pb={3}
                      px={2}
                      w="100%"
                      fontFamily="Work sans"
                      display="flex"
                      justifyContent={{ base: "space-between" }}
                      alignItems="center"
                  >
                      <IconButton
                      display={{base:"flex",md:"none"}}
                      icon={<ArrowBackIcon/>}
                          onClick={()=>setSelectedChat("")}
                      />
                      {!SelectedChat?.isGroupChat ? (
                          <>
                              {getSender(user, SelectedChat?.users)}
                              <ProfileModal user={getSenderFull(user,SelectedChat?.users) } />
                          </>
                      ) : (
                              <>
                                  {SelectedChat?.chatName?.toUpperCase()}
                                  <UpdateGroupChatModal
                                      fetchAgain={fetchAgain}
                                      setFetchAgain={setFetchAgain}
                                      fetchMessages={fetchMessages}
                                  />
                              </>
                      )}
                  </Text>
                  <Box
                      display="flex"
                      flexDir="column"
                      justifyContent="flex-end"
                      p={3}
                      bg="#E8E8E8"
                      w="100%"
                      h="100%"
                      borderRadius="lg"
                      overflowY="hidden"
                  >
                      {loading ? ( <Spinner
                          size="xl"
                          w={20}
                          h={20}
                          alignSelf="center"
                          margin="auto"
                      />
                      ) : (
                              <div className="messages">
                                  <ScrollableChat messages={message} />    
                              </div>
                              
                      )}

                      <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                          {isTyping ? <div><Lottie
                              options={defaultOptions}
                              width={70}
                              style={{marginBottom:15,marginLeft:0}}
                              
                          /></div> : (<></>)}
                          <Input
                              variant="filled"
                              bg="#E0E0E0"
                              placeholder="Enter a message.."
                              onChange={typingHandler}
                              value={newMessage}
                          />
                      </FormControl>
                     
                  </Box>
              </>
          ) : (
                  <Box display="flex" alignItems="center" h="100%">
                      <Text fontSize="3xl"pb={3}fontFamily="Work Sans">Click on user to start chatting</Text>
                  </Box>
                  
          )}
    </>
  )
}

export default SingleChat
