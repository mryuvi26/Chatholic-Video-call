import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';
export async function getRecommendedUsers(req, res) {
      try {
          const currentUserid = req.user._id;
          const currentUser = req.user ;

          const recommendedUsers = await User.find({
            $and: [
                {_id:{$ne: currentUserid}},
                {_id: {$nin: currentUser.friends}},
                {_id: {$nin: currentUser.blocked}},
                {isOnboarded:true}
            ]
          })
          res.status(200).json({success:true, users: recommendedUsers});
      } catch (error) {
         console.error("Error in getRecommendedUsers controller:", error);
            res.status(500).json({success:false, message: "Internal Server Error"});
      }
 }

 export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user._id)
        .select("friends")
        .populate("friends", "fullName profilePic nativeLanguage learningLanguage");
        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller:", error);
        res.status(500).json({success:false, message: "Internal Server Error"}); 
    }
 }

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user._id;
    const { id: recipientId } = req.params;

    // Cannot send request to yourself
    if (myId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send friend request to yourself",
      });
    }

    // Find recipient
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient user not found",
      });
    }

    // Check if already friends
    const alreadyFriends = recipient.friends.some(
      (friendId) => friendId.toString() === myId.toString()
    );

    if (alreadyFriends) {
      return res.status(400).json({
        success: false,
        message: "You are already friends with this user",
      });
    }

    // Check only pending requests
    const existingRequest = await FriendRequest.findOne({
      $or: [
        {
          sender: myId,
          recipient: recipientId,
          status: "pending",
        },
        {
          sender: recipientId,
          recipient: myId,
          status: "pending",
        },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Friend request already exists between you and this user",
      });
    }

    // Create new friend request
    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      friendRequest,
    });
  } catch (error) {
    console.error("Error in sendFriendRequest controller:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    if (
      friendRequest.recipient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this friend request",
      });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Friend request is already ${friendRequest.status}`,
      });
    }

    // Update request status
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add sender to recipient's friends
    await User.findByIdAndUpdate(
      friendRequest.recipient,
      {
        $addToSet: {
          friends: friendRequest.sender,
        },
      }
    );

    // Add recipient to sender's friends
    await User.findByIdAndUpdate(
      friendRequest.sender,
      {
        $addToSet: {
          friends: friendRequest.recipient,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Friend request accepted successfully",
    });
  } catch (error) {
    console.error(
      "Error in acceptFriendRequest controller:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function getFriendRequests(req, res) {
     try {
         const incomingRequests = await FriendRequest.find({
            recipient: req.user._id, 
            status: "pending"
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        const acceptedRequests = await FriendRequest.find({
            recipient: req.user._id, 
            status: "accepted"
        }).populate("sender", "fullName profilePic");
        
         res.status(200).json({success:true, incomingRequests, acceptedRequests});

     } catch (error) {
        console.error("Error in getFriendRequests controller:", error);
        res.status(500).json({success:false, message: "Internal Server Error"});
     }
}

export async function getOutgoingFriendReqs(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find({
           sender: req.user._id, 
           status: "pending"
       }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");
         res.status(200).json({success:true, outgoingRequests});
    } catch (error) {
       console.error("Error in getOutgoingFriendReqs controller:", error);
       res.status(500).json({success:false, message: "Internal Server Error"});
    }
}