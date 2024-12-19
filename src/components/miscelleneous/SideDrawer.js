import {
  Box, Button, Tooltip, Text, Menu, MenuButton, MenuList, Avatar, MenuItem,
  MenuDivider, Drawer, DrawerContent, DrawerOverlay, DrawerHeader, DrawerBody, Input, Toast, useToast, position,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { BellIcon,ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./profileModal";
import { useHistory } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/hooks"
import axios from "axios"
import Chatloading from "../Chatloading";
import UserListItem from "../UserAvatar/UserListitem";
import{ Spinner }from"@chakra-ui/spinner";

const SideDrawer = () =>
{
  const [search, setSearch] = useState("")
  const [searchResult, setSearchReasult] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  
  const { user,setSelectedChat,chats,setChats } = ChatState();
  console.log('use',user)
  const history = useHistory();
  const{isOpen,onOpen,onClose}=useDisclosure()

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history?.push("/");
  };
   const Toast = useToast()
  const handleSearch = async () => {
    if (!search) {
      Toast({
        title: "please enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        postion: "top-left",
      });
      return;
    }
    try {
      setLoading(true)
    
      const config = {
        headers: {
          authorization: `Bearer ${user.token}`,
        }
      };

      console.log('config',config)
      const { data } = await axios.get(`/api/user?${search}`, config)
      console.log('data',data)
      setLoading(false);
      setSearchReasult(data);

    } catch (error) {
      Toast({
        title: "Error Occured",
        description: "failed to load thesearch results",
        status: 5000,
        isClosable: true,
        position: "bottom-left",

      })
    } 
  };
 
    
  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c?._id === data?._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      Toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }
  return <>
    
     <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text d={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Talk-A-Tive
        </Text>

            <div>
          <Menu>
              <MenuButton p={1}>
               <BellIcon fontSize="2xl" m={1}/>
              </MenuButton>
              <MenuList></MenuList>
            </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>{" "}
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
    <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">Search Users </DrawerHeader>
      <DrawerBody>
        <Box display="flex" pb={2}>
        <Input placeholder="search by name by or email"
          mr={2}
          value={search}
        onChange={(e)=> setSearch(e.target.value)}/>
        <Button
         onClick={handleSearch}>go</Button>
          </Box>
          {loading ? <Chatloading /> : (
            searchResult?.map(user => (
              <UserListItem
                key={user?._id}
                user={user}
                  handlefunction={() => accessChat(user?._id)}
              />
            ))
          )}
          {loadingChat&&<Spinner ml="auton" display="flex"/>}
      </DrawerBody>
      </DrawerContent>
      
    </Drawer>
  </>
    
}
export default SideDrawer
