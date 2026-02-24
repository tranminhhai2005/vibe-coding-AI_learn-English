require "xcodeproj"

bundle_identifier = ENV.fetch("APP_BUNDLE_ID")
project_path = "ios/Runner.xcodeproj"
abort "Missing Xcode project at #{project_path}" unless File.directory?(project_path)

project = Xcodeproj::Project.open(project_path)
runner = project.targets.find { |target| target.name == "Runner" }
abort "Runner target not found in #{project_path}" unless runner

runner.build_configurations.each do |configuration|
  configuration.build_settings["PRODUCT_BUNDLE_IDENTIFIER"] = bundle_identifier
  configuration.build_settings["IPHONEOS_DEPLOYMENT_TARGET"] = "15.5"
end

project.save

podfile_path = "ios/Podfile"
podfile = File.read(podfile_path)
unless podfile.sub!(
  /^platform :ios, ['"][^'"]+['"]/,
  "platform :ios, '15.5'",
)
  abort "Could not set the iOS deployment target in #{podfile_path}"
end

File.write(podfile_path, podfile)
