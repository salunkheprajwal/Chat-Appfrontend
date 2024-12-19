import React, { useEffect, useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import { Box, Button, Stack, useToast ,Text} from '@chakra-ui/react';
import axios from 'axios';
import { AddIcon } from '@chakra-ui/icons';
import Chatloading from '../Chatloading';
import { getSender } from '../../config/ChatLogics';
import GroupChatModal from './../miscelleneous/GroupChatModal';
const MyChats = ({fetchAgain}) => {
  const [loggedUSer, setloggedUser] = useState();
    const {SelectedChat,setSelectedChat,user,chats,setChats } = ChatState();
  const Toast = useToast();
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          authorization: `Bearer ${user.token}`,    
        }
      };
      const { data } = await axios.get("/api/chat/", config)
      console.log('datataaa',data)
      console.log(data)
      setChats(data);
      
    } catch (error) {
      Toast({
        title: "Error Occured",
        description: "failed to load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      })
      
    }
  };
  useEffect(()=> {
 setloggedUser(JSON.parse(localStorage.getItem("userInfo")))
    fetchChats();
  }, [fetchAgain])
  return <Box
    display={{ base: SelectedChat ? "none" : "flex", md: "flex" }}
    flexDir="column"
    alignItems="center"
    padding={3}
    bg="white"
    width={{ base: "100%", md: "31%" }}
    borderRadius="lg"
  borderWidth="1px"  
  >
     <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
      My Chats
      <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            >
            New Group Chat
          </Button>
            </GroupChatModal>
        
      </Box>
    <Box display="flex"
      flexDir="column"
      p={3}
      bg="#F8F8F8"
      width="100%"
      h="100%"
      borderRadius="lg"
      overflowY="hidden"
    >
      {chats ? (
        <Stack overflowY="scroll">
          {chats?.map((chat) => (
            <Box
              onClick={() => setSelectedChat(chat)}
              cursor="pointer"
              bg={SelectedChat === chat ? "#38B2AC" : "E8E8E8"}
              color={SelectedChat === chat ? "white" : "black"}
              px={3}
              py={2}
              borderRadius="lg"
              key={chat?._id}
            >
              <Text>
                {!chat.isGroupChat ? getSender(loggedUSer,chat?.users): chat?.chatName}
              </Text>
            </Box>
          ))}
        </Stack>
      ) : (
          <Chatloading/>
      )}

    </Box>
  </Box>
}

export default MyChats
