package expo.modules.video.records

import androidx.media3.common.MediaItem
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.video.UnsupportedDRMTypeException
import expo.modules.video.VideoManager
import java.io.Serializable

class VideoSource(
  @Field var uri: String? = null,
  @Field var drm: DRMOptions? = null
) : Record, Serializable {
  private fun toMediaId(): String {
    return "uri:${this.uri}" +
      "DrmType:${this.drm?.type}" +
      "DrmLicenseServer:${this.drm?.licenseServer}" +
      "DrmMultiKey:${this.drm?.multiKey}" +
      "DRMHeadersKeys:${this.drm?.headers?.keys?.joinToString {it}}}" +
      "DRMHeadersValues:${this.drm?.headers?.values?.joinToString {it}}}"
  }
  fun toMediaItem(): MediaItem {
    val itemBuilder = MediaItem
      .Builder()
      .setUri(this.uri ?: "")
      .setMediaId(this.toMediaId())

    this.drm?.let {
      if (it.type.isSupported()) {
        itemBuilder.setDrmConfiguration(it.toDRMConfiguration())
      } else {
        throw UnsupportedDRMTypeException(it.type)
      }
    }
    val mediaItem = itemBuilder.build()
    VideoManager.registerVideoSourceToMediaItem(mediaItem, this)
    return mediaItem
  }
}
