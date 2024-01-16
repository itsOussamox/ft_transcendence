import React, { useEffect, useRef, useState } from 'react';
import styles from './FriendInfo.module.css';
import styled from 'styled-components';
import { Backend_URL } from '@/lib/Constants';
import { AddSearchInterface } from '../interfaces';
import GroupComponent from '../Header/GroupComponent';

import { connect } from 'react-redux';
import { toggleShowGroups } from '@/features/booleans/booleanActions';
// const ShowGroupsContainer = styled.div`
// background: rgba(154, 155, 211, 0.2);
// display: flex;
// align-items: center;
// width: 90%;
// // width: 100%;
// padding: 6px 10px;
// box-sizing: border-box;
// border-bottom: 1px solid rgba(154, 155, 211, 0.2);
// margin: 15px 10px;
// border-radius: 15px;
// `;

const ShowGroupsList = styled.div`
flex: 1;
display: flex;
flex-direction: column;
border-top-left-radius: 10px;
width: 100%;
height: 100%;
overflow-y: auto;
justify-content: flex-start;
align-items: center;

  // @media (max-height: 1100px) and (min-height: 700px)
  // {

  // }
  // @media (max-width: 550px)
  // {

  // }
`;

const ShowGroupsContainer = styled.div`
  background: rgba(154, 155, 211, 0.2);
  display: flex;
  align-items: center;
  width: 85%;
  // width: 100%;
  heigh: 120px;
  padding: 6px 10px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(154, 155, 211, 0.2);
  margin: 15px 10px;
  border-radius: 15px;
`;

interface showGroupProps
{
  onClose: () => void;
  parentType: string;
  showGroups: boolean;
  toggleShowGroups: () => void;
}

const ShowGroups = React.forwardRef<HTMLDivElement, showGroupProps>((props) => {
  const parentType = props.parentType;
  const onClose = props.onClose;
  const { showGroups, toggleShowGroups} = props;
  const [isLoading, setisLoading] = useState(false);
  const [ChannelFriendSearch, setChannelFriendSearch] = useState<AddSearchInterface[]>([]);
  const [ShowGroups, setShowGroups] = useState(true);
  const showRef = useRef<HTMLDivElement>(null);

  const fetchChannelGroups = async () => {
    try {
      const res = await fetch( Backend_URL+"channels/toAddSearch", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setChannelFriendSearch(data);
      } else
      {
        alert("Error fetching data: ");
        console.error("Error fetching data: ", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchChannelGroups();
  }, []);

  const handleClickOutside = (event: any) => {
    if (showRef.current && !showRef.current.contains(event.target as Node))
    {
      onClose();
      toggleShowGroups();
    }
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose])


  return (
    <div onClick={handleClickOutside} className="addChannelOverlay flex justify-center items-center ">
      <div ref={showRef} className={styles['info-container']}>
        <ShowGroupsList>
          {ChannelFriendSearch.map((friend) => {
            return (
              <ShowGroupsContainer>
              <GroupComponent
                key={friend.id}
                id={friend.id} 
                channelName={friend.channelName}
                channelPic={friend.channelPic}
                members={friend.members}
                bannedUsers={friend.bannedUsers}  
                setChannelFriendSearch={setChannelFriendSearch}
                ShowGroups={ShowGroups}
                />
                </ShowGroupsContainer>
            );
          })}
        </ShowGroupsList>
      </div>
    </div>
  );
});

const mapStateToProps = (state: RootState) => {
  return {
    ShowGroups: state.booleans.showGroups,
  };
};

const mapDispatchToProps = {
  toggleShowGroups,
};

export default connect(mapStateToProps, mapDispatchToProps)(ShowGroups);