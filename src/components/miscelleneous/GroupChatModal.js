import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListitem'
import UserBadgeItem from "../UserAvatar/UserBadgeItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure(); 
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setsearch] = useState();
  const [searchResult, setsearchResult] = useState([]);
  const [loading, setLoading] = useState();
  const Toast = useToast();
  const { user, chats, setChats } = ChatState();
  const handleSearch = async (query) => {
    setsearch(query);
    if (!query) {
      return;
    }
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        }
      };
      const { data } = await axios.get(`/api/user?search=${search}`,config);
      console.log(data);
      setLoading(false);
      setsearchResult(data);
    } catch (error) {
      Toast({
        title: "Error",
        description: "Failed to Load the Search Result",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      })
      
    }
  };
  const handlSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      Toast({
        title: "please fill all the details",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      const config = {
        headers: {
          authorization: `Bearer ${user.token}`,
        }
      };
      const { data } = await axios.post("/api/chat/group",
      {
          name: groupChatName,
          users: JSON.stringify(selectedUsers?.map((u) => u?._id)),
        },
        config
      );
      setChats([data, ...chats]);
      onClose();
      Toast(({
        title: "Group Chat created",
        status: "success",
        duration: 5000,
        isClosable: true,
        position:"bottom"
      }))
    } catch (error) {
      Toast({
        title: "failed to create the chat",
        description:error?.response?.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position:"bottom"
      })
      
      
    }
   };
  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter(sel => sel?._id !== delUser?._id))
     };

  const handleGroup = (userToAdd) => {
    if (selectedUsers?.includes(userToAdd)) {
      Toast({
        title: "User Already Added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position:"top",
      })
        
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
     };

  return (
    <>
          <span onClick={onOpen}>{ children }</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="work sans"
            display="flex"
          justifyContent="center">
          Create Group Chats
        </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input placeholder="Chat Name" mb={3}
              onChange={(e)=>setGroupChatName(e.target.value)}
              />
            </FormControl>
             <FormControl>
              <Input placeholder="Add users"
                mb={1}
              onChange={(e)=>handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" display="flex" flexWrap="wrap"> 
            {selectedUsers?.map((u) => (
              <UserBadgeItem
                key={user?._id}
                user={u}
                handleFunction={()=>handleDelete(u)}
              />
            ))}
           </Box>

            {loading ? <div>loading</div> : (
              searchResult?.slice(0, 4)?.map(user => <UserListItem key={user?._id} user={user} handleFunction={()=> handleGroup(user)}/> )
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' onClick={handlSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}


export default GroupChatModal
