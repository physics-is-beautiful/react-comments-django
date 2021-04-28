/*
 * ThreadPage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useEffect, useState, memo } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import InfiniteScroll from 'react-infinite-scroller'
import { bindActionCreators, compose } from 'redux'
import { createStructuredSelector } from 'reselect'
// import { Comment, Segment } from 'semantic-ui-react'

import { useInjectReducer } from '../../utils/injectReducer'
import { useInjectSaga } from '../../utils/injectSaga'

import Breadcrumb from '../../components/Breadcrumb'
import H2 from '../../components/H2'
// import CommentItem from 'components/Comment'
// import arrayToTree from './arrayToTree'

// import ReactMarkdown from 'react-markdown'
// import MathJax from 'react-mathjax2'
// import RemarkMathPlugin from 'remark-math'
// import SectionSheet from './SectionSheet'

import {
  makeSelectThread,
  makeSelectPosts,
  makeSelectNewPost,
  makeSelectUpdatedPost,
  makeSelectDeletedPost,
  // makeSelectLoading,
  // makeSelectError,
} from './selectors'

import {
  makeSelectTopic,
  // makeSelectLoading,
  // makeSelectError,
} from '../Topics/selectors'

import CenteredSection from './CenteredSection'
import Section from './Section'
// import messages from './messages'
import * as threadActionsCreator from './actions'
import * as topicsActionsCreator from '../Topics/actions'
import * as appActionsCreator from '../App/actions'

import reducer from './reducer'
import saga from './saga'

import topicsReducer from '../Topics/reducer'
import topicsSaga from '../Topics/saga'

import appReducer from '../App/reducer'
import appSaga from '../App/saga'

import history from '../../utils/apphistory'
import { Post } from '../../components/Comment/post'
import { RootPost } from '../../components/Comment/rootPost'
import { makeSelectSignedInUser } from '../App/selectors'
import { settings } from '../../settings'

// import { ReplyForm } from '../../components/Comment/replyForm'

// import history from '../../utils/history'

const threadKey = 'thread'
const topicsKey = 'topics'
const appKey = 'app'

// const MarkdownMathRender = props => {
//   const newProps = {
//     ...props,
//     plugins: [RemarkMathPlugin],
//     renderers: {
//       ...props.renderers,
//       math: _props => <MathJax.Node>{_props.value}</MathJax.Node>,
//       inlineMath: _props => <MathJax.Node inline>{_props.value}</MathJax.Node>,
//     },
//   }
//
//   return (
//     <MathJax.Context input="tex">
//       <ReactMarkdown {...newProps} />
//     </MathJax.Context>
//   )
// }

export function ThreadPage({
  threadActions,
  topicsActions,
  appActions,
  match,
  postsList, // post list from server
  newPost,
  updatedPost,
  deletedPost,
  thread,
  topic,
  signedInUser,
  threadId,
  anonAsUserObject = settings.anonAsUserObject,
  history: _history,
}) {
  useInjectReducer({ key: threadKey, reducer })
  useInjectSaga({ key: threadKey, saga })

  useInjectReducer({ key: topicsKey, reducer: topicsReducer })
  useInjectSaga({ key: topicsKey, saga: topicsSaga })

  useInjectSaga({ key: appKey, saga: appSaga })
  useInjectReducer({ key: appKey, reducer: appReducer })

  const [posts, setPosts] = useState([]) // posts list loaded in a client side
  const [hasMoreItems, setHasMoreItems] = useState(false)
  const [nextHref, setNextHref] = useState(null)

  const [breadcrumbSections, setBreadcrumbSections] = useState([])

  let parentUrlPrefix = ''
  if (match) {
    ;[parentUrlPrefix] = [match.path.split('/:topicSlug')]
  }

  useEffect(() => {
    if (topic) {
      // TODO generate this

      let baseName = ''
      if (_history) {
        baseName = _history.createHref({ pathname: '' }).slice(0, -1)
      }
      setBreadcrumbSections([
        {
          key: 'Topics',
          content: 'Topics',
          href: `${baseName}${parentUrlPrefix}/topics`,
          // link: true,
          onClick: evt => {
            evt.preventDefault()
            // inside history do not know about external history basename, so add this
            history.push(`${baseName}${parentUrlPrefix}/topics`)
            if (_history) {
              // parent app history
              _history.push({ pathname: `${parentUrlPrefix}/topics` })
            }
          },
        },
        {
          key: topic.slug,
          content: topic.title,
          href: `${baseName}${parentUrlPrefix}/topics/${topic.slug}`,
          // link: true,
          onClick: evt => {
            evt.preventDefault()
            history.push(`${baseName}${parentUrlPrefix}/topics/${topic.slug}`)
            if (_history) {
              // parent app history
              _history.push({
                pathname: `${parentUrlPrefix}/topics/${topic.slug}`,
              })
            }
          },
        },
      ])
    }
  }, [topic])

  // post was updated from server
  useEffect(() => {
    if (updatedPost) {
      setPosts(
        posts.map(item => {
          if (updatedPost.uid === item.uid) {
            return updatedPost
          }
          return item
        }),
      )
    }
  }, [updatedPost])

  useEffect(() => {
    if (!signedInUser) {
      appActions.loadSignedInUser()
    }
  }, [])

  useEffect(() => {
    // loaded as Component / threadId changed
    if (threadId) {
      threadActions.loadPosts(threadId)
    }
    return () => {
      // clear topics list berfore threadId
      clearThread()
    }
  }, [threadId])

  const clearThread = () => {
    setHasMoreItems(false)
    setPosts([])
    threadActions.postsLoaded(false)
    threadActions.newPostSuccess(null)
  }

  useEffect(() => {
    if (match) {
      // loaded as SPA
      if (!topic) {
        topicsActions.loadTopic(match.params.topicSlug)
      }
      // load thread from server
      threadActions.loadThread(match.params.threadId)
      // load posts of thread from server
      threadActions.loadPosts(match.params.threadId)
    }

    // reset on unmount
    return () => {
      clearThread()
    }
  }, [])

  useEffect(() => {
    function mergeUnique(a, b, prop) {
      const reduced = a.filter(
        aItem => !b.find(bItem => aItem[prop] === bItem[prop]),
      )
      return reduced.concat(b)
    }

    if (postsList) {
      // remove existing comments
      setPosts(
        mergeUnique(posts, postsList.results, 'uid'),
        // [...posts, ...postsList.results]
      )
      setHasMoreItems(Boolean(postsList.next))
      setNextHref(postsList.next)
    }
  }, [postsList])

  useEffect(() => {
    // find parent in posts and append
    if (newPost) {
      // find last index with
      const parentIndex = posts.findIndex(x => x.uid === newPost.parent)
      const postsCopy = [...posts]
      postsCopy.splice(parentIndex + 1, 0, newPost)
      setPosts(postsCopy)
    }
  }, [newPost])

  useEffect(() => {
    if (deletedPost) {
      // setPosts(posts.filter(item => deletedPost.uid !== item.uid)) //  remove deleted post
      setPosts(
        posts.map(item => {
          if (deletedPost.uid === item.uid) {
            return deletedPost
            // const deletedPostCopy = Object.assign({}, item)
            // deletedPostCopy.content = '\\[deleted\\]'
            // deletedPostCopy.created_by.id = 0
            // deletedPostCopy.created_by.username = '[deleted]'
            // return deletedPostCopy
          }
          return item
        }),
      )
    }
  }, [deletedPost])

  const handleAddSubmit = args => {
    threadActions.newPost(args)
  }

  const handleUpdateSubmit = args => {
    threadActions.updatePost(args)
  }

  const handleDeleteSubmit = args => {
    threadActions.deletePost(args)
  }

  const handleVote = (...args) => {
    threadActions.votePost(...args)
  }

  // it is better to use this func as checkUserAuth (in post/root post) fixme
  const getCurrentUser = () => {
    if (!signedInUser) {
      return null
    }

    if (
      // if user loads as object with {is_anonymous: true} attr
      signedInUser &&
      anonAsUserObject &&
      Object.prototype.hasOwnProperty.call(signedInUser, 'is_anonymous') &&
      signedInUser.is_anonymous
    ) {
      return null
    }

    return signedInUser
  }

  // let comments = []
  let rootComment = null

  if (posts.length > 0) {
    rootComment = (
      <RootPost
        post={posts[0]}
        onSubmitReplay={handleAddSubmit}
        onSubmitEdit={handleUpdateSubmit}
        currentProfile={getCurrentUser()}
        changePostVote={(...args) => {
          handleVote(...args)
        }}
        onDelete={handleDeleteSubmit}
        showReplyFormOnly={Boolean(threadId)}
      />
    )
  }

  const renderPost = (post, onSubmitReplay, onSubmitEdit, onSubmitDelete) => {
    const widthRem = `${post.level}rem`

    if (post.level === 0) {
      return null
    }

    return (
      <div key={post.uid} style={{ paddingLeft: widthRem }}>
        <div
          style={{
            width: widthRem,
            display: 'inline-block',
            height: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* TODO: add threadline if needed */}
        </div>
        <div style={{ position: 'relative' }}>
          {/* TODO: add react memo effect */}
          <Post
            post={post}
            onSubmitReplay={onSubmitReplay}
            onSubmitEdit={onSubmitEdit}
            currentProfile={getCurrentUser()}
            changePostVote={(...args) => {
              handleVote(...args)
            }}
            onDelete={onSubmitDelete}
          />
        </div>
      </div>
    )
  }

  // load next page comments
  const loadNextPage = () => {
    if (hasMoreItems) {
      // if we call next page setHasMore item false and waiting for a server response
      setHasMoreItems(Boolean(false))
      threadActions.loadPosts(threadId || match.params.threadId, nextHref)
    }
  }

  // all pages comments / todo check for performance
  const comments = posts
    .filter(function(item) {
      if (item.level === 0) {
        return false
      }
      return true
    })
    .map(item =>
      renderPost(item, handleAddSubmit, handleUpdateSubmit, handleDeleteSubmit),
    )

  return (
    <article>
      {!threadId && (
        <React.Fragment>
          <Helmet>
            {/* TODO add titles */}
            <title>Thread</title>
            <meta
              name="description"
              content="React comments Django React thread"
            />
          </Helmet>
          <Breadcrumb sections={breadcrumbSections} />
        </React.Fragment>
      )}
      <div>
        <CenteredSection>
          <H2>
            {thread && thread.title}
            {/* <FormattedMessage {...messages.postsList} /> */}
          </H2>
        </CenteredSection>
        {/* root post */}
        {rootComment}
        <Section>
          <InfiniteScroll
            pageStart={0}
            loadMore={loadNextPage}
            hasMore={hasMoreItems}
            // loader={<div key={this.state.nextHref} style={{clear: 'both'}} />} // fix https://github.com/CassetteRocks/react-infinite-scroller/issues/14#issuecomment-225835845
          >
            {/* <Comment.Group threaded>{comments}</Comment.Group> */}
            {comments}
            {postsList && postsList.count === 0 && (
              <h4>There are no comments to show</h4>
            )}
          </InfiniteScroll>
        </Section>
      </div>
    </article>
  )
}

ThreadPage.propTypes = {
  threadActions: PropTypes.shape({
    loadThread: PropTypes.func.isRequired,
    loadPosts: PropTypes.func.isRequired,
    postsLoaded: PropTypes.func.isRequired,
    updatePost: PropTypes.func.isRequired,
    deletePost: PropTypes.func.isRequired,
    newPost: PropTypes.func.isRequired,
    votePost: PropTypes.func.isRequired,
  }).isRequired,
  appActions: PropTypes.shape({
    loadSignedInUser: PropTypes.func.isRequired,
  }).isRequired,
  topicsActions: PropTypes.shape({
    loadTopic: PropTypes.func.isRequired,
  }).isRequired,
  match: PropTypes.object,
  thread: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  postsList: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  topic: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  newPost: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  updatedPost: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  deletedPost: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  signedInUser: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  threadId: PropTypes.number,
  anonAsUserObject: PropTypes.bool,
}

const mapStateToProps = createStructuredSelector({
  postsList: makeSelectPosts(),
  topic: makeSelectTopic(),
  thread: makeSelectThread(),
  newPost: makeSelectNewPost(),
  updatedPost: makeSelectUpdatedPost(),
  deletedPost: makeSelectDeletedPost(),
  signedInUser: makeSelectSignedInUser(),
  // loading: makeSelectLoading(),
  // error: makeSelectError(),
})

export function mapDispatchToProps(dispatch) {
  return {
    threadActions: bindActionCreators(threadActionsCreator, dispatch),
    topicsActions: bindActionCreators(topicsActionsCreator, dispatch),
    appActions: bindActionCreators(appActionsCreator, dispatch),
  }
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
)

export default compose(
  withConnect,
  memo,
)(ThreadPage)
