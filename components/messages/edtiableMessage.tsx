// "use client"
// import { useState, forwardRef, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Textarea } from '@/components/ui/textarea'
// import { Edit2, Check, Trash2 } from 'lucide-react'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { deleteMessage, fetchChatCreatorProfile, fetchChatSupplierProfile, updateMessage } from '@/lib/supabase/messages'
// import { useUser } from './session'

// interface Sender {
//   id: string
//   name: string
//   company_logo: string
// }

// interface Message {
//   id: string
//   created_at: string
//   message: string
//   sender_id: string
//   receiver_id: string
//   sender?: Sender
//   user: {
//     id: string
//   }
// }

// interface EditableMessageProps {
//   message: Message
//   user?: { id: string }
// }

// export const EditableMessage = forwardRef<HTMLDivElement, EditableMessageProps>(
//   ({ message }, ref) => {
//     const [isEditing, setIsEditing] = useState(false)
//     const [editedtext, setEditedtext] = useState(message.message)
//     const [profile, setProfile] = useState<{ name: string; avatar_url: string } | null>(null)
//     const [loadingProfile, setLoadingProfile] = useState(true); // Loading state for profile
//     const user = useUser();

//     useEffect(() => {
//       const loadProfile = async () => {
//         if (!message.sender?.name) {
//           const userProfile = await fetchUserProfile(message.sender_id);
//           if (userProfile) {
//             setProfile(userProfile);
//           }
//         } else {
//           setProfile({ name: message.sender?.name || "Unknown", avatar_url: message.sender?.company_logo || "" });
//         }
//         setLoadingProfile(false); // Set loading state to false once profile is fetched
//       };

//       loadProfile();
//     }, [message.sender_id, message.sender]);

//     const handleEdit = async () => {
//       if (isEditing) {
//         if (editedtext !== message.message) {
//           await updateMessage(editedtext, message.id);
//         }
//       }
//       setIsEditing(!isEditing);
//     };

//     const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//       if (e.key === 'Enter' && !e.shiftKey) {
//         e.preventDefault();
//         handleEdit();
//       }
//     };

//     const fetchUserProfile = async (userId: string) => {
//       try {
//         const supplier = await fetchChatSupplierProfile(userId);
//         if (supplier) {
//           return {
//             id: userId,
//             name: supplier.company_name || "Supplier",
//             avatar_url: supplier.company_logo || "", // Assuming supplier avatar exists
//           };
//         }

//         const creator = await fetchChatCreatorProfile(userId);
//         if (creator) {
//           return {
//             id: userId,
//             name: creator.full_name || "Creator",
//             avatar_url: creator.avatar_url || "",
//           };
//         }

//         return null;
//       } catch (err) {
//         console.error("Error fetching user profile:", err);
//         return null;
//       }
//     };

//     const isSender = message.sender_id === user?.id;

//     // Calculate if the message can be edited (within 24 hours)
//     const messageDate = new Date(message.created_at);
//     const currentDate = new Date();
//     const timeDifference = currentDate.getTime() - messageDate.getTime();
//     const canEdit = timeDifference <= 24 * 60 * 60 * 1000;


//     return (
//       <div
//         className={`flex items-start space-x-2 mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}
//         ref={ref}
//         onClick={() => !isEditing && canEdit && setIsEditing(true)} // Trigger edit mode only if within 24 hours
//       >
//         {!isSender && profile && (
//           <Avatar>
//             <AvatarImage src={profile.avatar_url || message.sender?.company_logo} />
//             <AvatarFallback>
//               {(profile?.name || message.sender?.name || "U")?.charAt(0)}
//             </AvatarFallback>
//           </Avatar>
//         )}

//         <div className={`flex-grow ${isSender ? 'text-right' : ''}`}>
//           {isEditing ? (
//             <Textarea
//               value={editedtext}
//               onChange={(e) => setEditedtext(e.target.value)}
//               onKeyDown={handleKeyDown}
//               className="mt-1"
//               rows={3}
//             />
//           ) : (
//             <p className="mt-1 whitespace-pre-wrap">{message.message}</p>
//           )}

//           <span className="text-xs text-gray-500 mt-1 block">
//             {new Date(message.created_at).toLocaleString()}
//           </span>
//         </div>

//         {isSender && (
//           <div className="flex flex-nowrap gap-2">
//             {isEditing && (
//               <>
//                 <Button variant="ghost" size="icon" onClick={handleEdit}>
//                   <Check className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => deleteMessage(message.id)}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </>
//             )}
//             {!isEditing && canEdit && (
//               <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
//                 <Edit2 className="h-4 w-4" />
//               </Button>
//             )}
//             {!canEdit && !isEditing && (
//               <Button variant="ghost" size="icon" disabled>
//                 <Edit2 className="h-4 w-4 text-gray-400" />
//               </Button>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   }
// );

// EditableMessage.displayName = 'EditableMessage';
