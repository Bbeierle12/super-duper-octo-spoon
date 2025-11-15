import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { MoreVert, Reply, Edit, Delete } from '@mui/icons-material';
import { commentsAPI } from '../../services/api';

interface Comment {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
  };
  content: string;
  createdAt: string;
  isEdited: boolean;
  editedAt?: string;
  parentCommentId?: string;
}

interface CommentsThreadProps {
  commentableType: string;
  commentableId: string;
}

export default function CommentsThread({
  commentableType,
  commentableId,
}: CommentsThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  useEffect(() => {
    fetchComments();
  }, [commentableType, commentableId]);

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getAll({ commentableType, commentableId });
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handlePost = async () => {
    if (!newComment.trim()) return;

    try {
      await commentsAPI.create({
        commentableType,
        commentableId,
        content: newComment,
        parentCommentId: replyingTo || undefined,
      });
      setNewComment('');
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await commentsAPI.update(commentId, { content: editContent });
      setEditingId(null);
      setEditContent('');
      fetchComments();
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentsAPI.delete(commentId);
      fetchComments();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, comment: Comment) => {
    setMenuAnchor(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedComment(null);
  };

  const startEdit = () => {
    if (selectedComment) {
      setEditingId(selectedComment.id);
      setEditContent(selectedComment.content);
      handleMenuClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const topLevelComments = comments.filter(c => !c.parentCommentId);
  const getReplies = (parentId: string) =>
    comments.filter(c => c.parentCommentId === parentId);

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <Box sx={{ mb: 2, ml: isReply ? 6 : 0 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {comment.user.email[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">
                {comment.user.email}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {formatDate(comment.createdAt)}
                  {comment.isEdited && ' (edited)'}
                </Typography>
              </Typography>
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, comment)}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>

            {editingId === comment.id ? (
              <Box sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button size="small" onClick={() => handleEdit(comment.id)} variant="contained">
                    Save
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {comment.content}
                </Typography>
                {!isReply && (
                  <Button
                    size="small"
                    startIcon={<Reply />}
                    onClick={() => setReplyingTo(comment.id)}
                    sx={{ mt: 1 }}
                  >
                    Reply
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Replies */}
      {!isReply &&
        getReplies(comment.id).map((reply) => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}

      {/* Reply Box */}
      {replyingTo === comment.id && (
        <Box sx={{ mt: 2, ml: 6 }}>
          <Paper sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Write a reply..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button size="small" onClick={handlePost} variant="contained">
                Reply
              </Button>
              <Button size="small" onClick={() => setReplyingTo(null)}>
                Cancel
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Comments ({comments.length})
      </Typography>

      {/* New Comment Box */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!!replyingTo}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handlePost}
            disabled={!newComment.trim() || !!replyingTo}
          >
            Post Comment
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* Comments List */}
      {topLevelComments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        topLevelComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))
      )}

      {/* Comment Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={startEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedComment && handleDelete(selectedComment.id)}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
